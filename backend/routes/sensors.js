// routes/sensors.js
const express = require('express');
const router = express.Router();
const SensorReading = require('../models/SensorReading');
const { protect, authorize } = require('../middleware/auth');

// POST /api/sensors -> add new sensor reading
router.post('/', protect, authorize('farmer', 'admin'), async (req, res) => {
  try {
    const { soilMoisture, temperature, humidity, location } = req.body;
    if (soilMoisture == null || temperature == null || humidity == null) {
      return res.status(400).json({ message: 'soilMoisture, temperature and humidity required' });
    }
    const reading = await SensorReading.create({
      soilMoisture,
      temperature,
      humidity,
      location: location || { type: 'Point', coordinates: [0, 0] },
      createdBy: req.user._id
    });
    res.status(201).json(reading);
  } catch (err) {
    console.error('Sensor post error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/sensors -> list all (admin sees all, farmer sees own)
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'farmer') {
      filter = { createdBy: req.user._id };
    }
    const readings = await SensorReading.find(filter).populate('createdBy', 'name email');
    res.json(readings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/sensors/advice -> basic irrigation decision
router.get('/advice', protect, async (req, res) => {
  try {
    const latest = await SensorReading.findOne({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    if (!latest) return res.json({ message: 'No sensor data found yet' });

    let advice = 'No irrigation needed';
    if (latest.soilMoisture < 30) {
      advice = 'Irrigate now (low soil moisture)';
    } else if (latest.temperature > 32 && latest.humidity < 40) {
      advice = 'Irrigate (hot and dry conditions)';
    }

    res.json({ latest, advice });
  } catch (err) {
    console.error('Advice error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/sensors/:id -> delete reading (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const reading = await SensorReading.findById(req.params.id);
    if (!reading) return res.status(404).json({ message: 'Reading not found' });

    if (reading.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await reading.remove();
    res.json({ message: 'Reading deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
