// routes/recommendations.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const SensorReading = require('../models/SensorReading');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Mock recommendation engine
function generateRecommendations(userData) {
  let recs = [];

  // Crop advice
  if (userData.soilMoisture < 30) {
    recs.push("Your soil moisture is low. Consider irrigating your crops today.");
  } else {
    recs.push("Soil moisture levels are healthy. No need to irrigate now.");
  }

  // Irrigation optimization
  if (userData.irrigationEvents > 5) {
    recs.push("You irrigated more than 5 times this week. Try reducing to save water.");
  }

  // Market insights
  if (userData.ordersCount > 10) {
    recs.push("You have good sales this month. Consider scaling up production.");
  } else {
    recs.push("Sales are low. Try listing more products or adjusting prices.");
  }

  return recs;
}

// GET /api/recommendations
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user-related data
    const latestIrrigation = await SensorReading.findOne({ farmer: userId }).sort({ createdAt: -1 });
    const userProducts = await Product.find({ farmer: userId });
    const userOrders = await Order.find({ farmer: userId });

    const userData = {
      soilMoisture: latestIrrigation?.soilMoisture || 40,
      irrigationEvents: await SensorReading.countDocuments({ farmer: userId, createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } }),
      productsCount: userProducts.length,
      ordersCount: userOrders.length
    };

    const recs = generateRecommendations(userData);

    res.json({
      success: true,
      recommendations: recs,
      dataUsed: userData
    });
  } catch (err) {
    console.error("Recommendations error:", err.message);
    res.status(500).json({ message: "Could not generate recommendations" });
  }
});

module.exports = router;
