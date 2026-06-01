const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findById(id);

    if (order) {
      order.status = status;
      const updatedOrder = await order.save();
      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ detail: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const usersCount = await User.countDocuments();
    
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    res.status(200).json({
      ordersCount,
      productsCount,
      usersCount,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getDashboardStats
};