const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../controllers/wishlistController');

router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(addToWishlist);

router.route('/:product_id')
  .delete(removeFromWishlist);

module.exports = router;