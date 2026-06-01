const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (req.file && req.file.path) {
    res.status(200).json({ url: req.file.path });
  } else {
    res.status(400).json({ detail: 'Image upload failed' });
  }
});

module.exports = router;