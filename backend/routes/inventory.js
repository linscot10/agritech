// routes/inventory.js
const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/InventoryItem');
const { protect } = require('../middleware/auth');

// ➕ Add inventory item (farmer or admin)
router.post('/', protect, async (req, res) => {
  try {
    const { name, category, quantity, unit, acquiredDate, expiryDate } = req.body;
    if (!name || !quantity) {
      return res.status(400).json({ message: "Name and quantity are required" });
    }

    const item = await InventoryItem.create({
      name,
      category: category || 'OTHER',
      quantity,
      unit,
      acquiredDate,
      expiryDate,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ message: "Error adding inventory item" });
  }
});

// 📋 Get all inventory items (farmer sees own, admin sees all)
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      filter = { createdBy: req.user._id };
    }
    const items = await InventoryItem.find(filter).populate('createdBy', 'name email');
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ message: "Error fetching inventory" });
  }
});

// ✏️ Update inventory item (owner or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // allow only owner or admin
    if (item.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }

    Object.assign(item, req.body);
    await item.save();

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ message: "Error updating item" });
  }
});

// ❌ Delete inventory item (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }

    await item.deleteOne();
    res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item" });
  }
});

module.exports = router;
