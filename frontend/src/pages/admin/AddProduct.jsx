import React, { useState } from 'react';
import { api } from '../../lib/api';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'acrylic_plaques',
    countInStock: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';

      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);

        const uploadRes = await api.post('/upload', uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        imageUrl = uploadRes.data.url || uploadRes.data;
      }

      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      await api.post('/products', {
        ...formData,
        slug: generatedSlug,
        image: imageUrl,
      });

      alert('Product added successfully!');

      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'acrylic_plaques',
        countInStock: '',
      });
      setImageFile(null);
      document.getElementById('image-upload').value = '';

    } catch (error) {
      alert('Failed to add product. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', backgroundColor: '#1a1a1a', color: 'white', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#B026FF' }}>Add New Anime Product</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#050505', color: 'white' }}
        />

        <textarea
          name="description"
          placeholder="Product Description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#050505', color: 'white' }}
        />

        <input
          type="number"
          name="price"
          placeholder="Price (₹)"
          value={formData.price}
          onChange={handleChange}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#050505', color: 'white' }}
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#050505', color: 'white' }}
        >
          <option value="acrylic_plaques">Acrylic Plaques</option>
        </select>

        <input
          type="number"
          name="countInStock"
          placeholder="Count In Stock"
          value={formData.countInStock}
          onChange={handleChange}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#050505', color: 'white' }}
        />

        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
          style={{ padding: '10px', border: '1px dashed #B026FF', borderRadius: '4px' }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            backgroundColor: loading ? '#555' : '#B026FF',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
        >
          {loading ? 'Uploading...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;