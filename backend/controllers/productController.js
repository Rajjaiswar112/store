const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ detail: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, slug, category, price, description, image } = req.body;
    
    const productExists = await Product.findOne({ slug });
    if (productExists) {
      return res.status(400).json({ detail: 'Product with this slug already exists' });
    }

    const product = await Product.create({
      name,
      slug,
      category,
      price,
      description,
      image
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.slug = req.body.slug || product.slug;
      product.category = req.body.category || product.category;
      product.price = req.body.price || product.price;
      product.description = req.body.description || product.description;
      product.image = req.body.image || product.image;

      const updatedProduct = await product.save();
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ detail: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.status(200).json({ message: 'Product removed' });
    } else {
      res.status(404).json({ detail: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

module.exports = {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};