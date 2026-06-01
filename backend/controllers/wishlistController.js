const Wishlist = require('../models/Wishlist');

const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [product_id] });
      return res.status(201).json(wishlist);
    }

    if (!wishlist.products.includes(product_id)) {
      wishlist.products.push(product_id);
      await wishlist.save();
    }

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { product_id } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== product_id
      );
      await wishlist.save();
      res.status(200).json(wishlist);
    } else {
      res.status(404).json({ detail: 'Wishlist not found' });
    }
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};