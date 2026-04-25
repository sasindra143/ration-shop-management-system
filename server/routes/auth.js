const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, username, password, shopNumber } = req.body;
    
    const userExists = await Admin.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await Admin.create({
      name,
      username, // this is the email/username
      password,
      shopNumber: shopNumber || '0806015',
      role: 'operator' // Default role for new signups
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      shopNumber: user.shopNumber,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    res.json({
      _id: admin._id,
      name: admin.name,
      username: admin.username,
      role: admin.role,
      shopNumber: admin.shopNumber,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
