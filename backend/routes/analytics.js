// routes/analytics.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Sensor = require('../models/SensorReading');
const Post = require('../models/Post');
const { protect, authorize } = require('../middleware/auth');

// 1. Sales Summary (admin or user-specific)
router.get('/sales', protect, async (req, res) => {
  try {
    let match = {};
    if (req.user.role !== 'admin') {
      match = { buyer: req.user._id };
    }

    const summary = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Top Products (by orders)
router.get('/top-products', protect, async (req, res) => {
  try {
    const top = await Order.aggregate([
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    const populated = await Product.populate(top, { path: '_id', select: 'name price' });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. Irrigation Trends (avg soil moisture & water usage)
router.get('/irrigation-trends', protect, async (req, res) => {
  try {
    const trends = await Sensor.aggregate([
      {
        $group: {
          _id: { day: { $dayOfMonth: '$createdAt' }, month: { $month: '$createdAt' } },
          avgMoisture: { $avg: '$soilMoisture' },
          avgWaterUsed: { $avg: '$waterUsed' }
        }
      },
      { $sort: { '_id.month': -1, '_id.day': -1 } },
      { $limit: 7 } // last 7 days
    ]);

    res.json(trends);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 4. Forum Engagement
router.get('/forum', protect, async (req, res) => {
  try {
    const postsCount = await Post.countDocuments();
    const commentsCount = await Post.aggregate([
      { $unwind: '$comments' },
      { $count: 'totalComments' }
    ]);

    res.json({
      posts: postsCount,
      comments: commentsCount[0]?.totalComments || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 5. Admin Dashboard (everything combined)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const [sales, topProducts, irrigation, forum] = await Promise.all([
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' }
          }
        }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: '$product',
            totalQuantity: { $sum: '$quantity' },
            totalRevenue: { $sum: '$totalPrice' }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 }
      ]),
      Sensor.aggregate([
        {
          $group: {
            _id: { day: { $dayOfMonth: '$createdAt' }, month: { $month: '$createdAt' } },
            avgMoisture: { $avg: '$soilMoisture' },
            avgWaterUsed: { $avg: '$waterUsed' }
          }
        },
        { $sort: { '_id.month': -1, '_id.day': -1 } },
        { $limit: 7 }
      ]),
      (async () => {
        const postsCount = await Post.countDocuments();
        const commentsCount = await Post.aggregate([
          { $unwind: '$comments' },
          { $count: 'totalComments' }
        ]);
        return {
          posts: postsCount,
          comments: commentsCount[0]?.totalComments || 0
        };
      })()
    ]);

    const populated = await Product.populate(topProducts, { path: '_id', select: 'name price' });

    res.json({
      sales,
      topProducts: populated,
      irrigation,
      forum
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
