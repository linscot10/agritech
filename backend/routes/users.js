// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');

// GET /api/users/     -> admin only: list users
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/:id  -> admin or owner
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    // allow owner or admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/me   -> update own profile (name, phone, password)
router.put('/me', protect, async (req, res) => {
  try {
    const updates = {};
    const { name, phone, password } = req.body;
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }
    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
