// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Create a notification (admin or system events)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'userId, title, and message required' });
    }

    const notif = await Notification.create({ user: userId, title, message, type });
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all notifications for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const notifs = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a notification
router.delete('/:id', protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: send notification to ALL users
router.post('/broadcast', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'title and message required' });

    const users = await Notification.db.collection('users').find().toArray();
    const notifs = users.map(u => ({
      user: u._id,
      title,
      message,
      type
    }));

    await Notification.insertMany(notifs);
    res.json({ message: 'Broadcast sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
