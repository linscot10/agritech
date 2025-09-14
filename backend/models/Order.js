// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  supplyChain: {
  status: {
    type: String,
    enum: ['PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'],
    default: 'PROCESSING'
  },
  updatedAt: { type: Date, default: Date.now },
  driver: { type: String },       // Assigned driver name
  vehicle: { type: String },      // Vehicle number/ID
  deliveryNotes: { type: String } // Optional notes (delays, issues, etc.)
}
 ,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
