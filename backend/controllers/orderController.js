const Order = require('../models/Order');
const Cart = require('../models/Cart');

const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ detail: 'Cart is empty' });
    }

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    }));

    const totalAmount = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

module.exports = {
  createOrder,
  getOrders
};