// models/SensorReading.js
const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  soilMoisture: { type: Number, required: true }, // percentage
  temperature: { type: Number, required: true },  // °C
  humidity: { type: Number, required: true },     // percentage
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SensorReading', sensorSchema);
