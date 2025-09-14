// models/Program.js
const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['SUBSIDY', 'TRAINING', 'GRANT'], required: true },
  eligibility: String,
  startDate: Date,
  endDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applicants: [
    {
      farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['APPLIED', 'APPROVED', 'REJECTED'], default: 'APPLIED' },
      appliedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
