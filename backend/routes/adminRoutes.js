const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getDashboardStats
} = require('../controllers/adminController');

router.use(protect, admin);

router.route('/orders').get(getAllOrders);
router.route('/orders/:id/status').put(updateOrderStatus);
router.route('/users').get(getAllUsers);
router.route('/stats').get(getDashboardStats);

module.exports = router;