const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createOrder, getOrders } = require('../controllers/orderController');

router.use(protect);

router.route('/')
  .get(getOrders)
  .post(createOrder);

module.exports = router;