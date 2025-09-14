// routes/geoData.js
const express = require('express');
const router = express.Router();
const GeoData = require('../models/GeoData');
const { protect } = require('../middleware/auth');

// ADD farm geo-data
router.post('/', protect, async (req, res) => {
  try {
    const { farmName, location, soilType, waterSource, produce } = req.body;

    const geoData = await GeoData.create({
      farmer: req.user._id,
      farmName,
      location,
      soilType,
      waterSource,
      produce
    });

    res.status(201).json({ success: true, geoData });
  } catch (err) {
    res.status(500).json({ message: "Error saving geo data" });
  }
});

// GET all geo-data (admin only)
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admins only" });
    }

    const geoData = await GeoData.find().populate('farmer', 'name email');
    res.json({ success: true, geoData });
  } catch (err) {
    res.status(500).json({ message: "Error fetching geo data" });
  }
});

// GET geo-data for logged-in farmer
router.get('/my-farm', protect, async (req, res) => {
  try {
    const geoData = await GeoData.find({ farmer: req.user._id });
    res.json({ success: true, geoData });
  } catch (err) {
    res.status(500).json({ message: "Error fetching your farm data" });
  }
});

module.exports = router;
