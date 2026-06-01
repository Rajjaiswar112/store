const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['acrylic_plaques', 'led_frames', 'posters', 'manga_canvas', 'neon_collectibles']
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);