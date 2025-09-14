// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['farmer', 'admin', 'tech'], default: 'farmer' },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
