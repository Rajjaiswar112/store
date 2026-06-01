const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ detail: 'Please add all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ detail: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        access_token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ detail: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        access_token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ detail: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ detail: 'Server Error' });
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    _id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    isAdmin: req.user.isAdmin,
  });
};

const logoutUser = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
};