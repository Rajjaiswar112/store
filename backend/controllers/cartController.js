const Cart = require('../models/Cart');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: product_id, quantity: quantity || 1 }]
      });
      return res.status(201).json(cart);
    }

    const itemIndex = cart.items.findIndex(p => p.product.toString() === product_id);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += (quantity || 1);
    } else {
      cart.items.push({ product: product_id, quantity: quantity || 1 });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ detail: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(p => p.product.toString() === product_id);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ detail: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { product_id } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ detail: 'Cart not found' });
    }

    cart.items = cart.items.filter(p => p.product.toString() !== product_id);
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};