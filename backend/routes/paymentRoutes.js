const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createPaymentIntent } = require('../controllers/paymentController');

// This matches the exact URL the frontend is looking for
router.post('/create-intent', protect, createPaymentIntent);

module.exports = router;