// models/InventoryItem.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['SEED', 'FERTILIZER', 'TOOL', 'EQUIPMENT', 'OTHER'], 
    default: 'OTHER' 
  },
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String, default: '' }, // e.g. kg, liters, pieces
  acquiredDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InventoryItem', inventorySchema);
