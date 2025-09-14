// models/GeoData.js
const mongoose = require('mongoose');

const geoDataSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmName: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  soilType: {
    type: String,
    enum: ['CLAY', 'SANDY', 'LOAMY', 'SILTY', 'PEATY', 'CHALKY'],
    required: true
  },
  waterSource: {
    type: String,
    enum: ['RIVER', 'WELL', 'RAINFED', 'IRRIGATION_SYSTEM'],
    required: true
  },
  produce: [{ type: String }], // e.g. ["Maize", "Tomatoes"]
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GeoData', geoDataSchema);
