// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// configure multer for image upload
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST /api/products  -> create product (farmer, admin)
router.post('/', protect, authorize('farmer', 'admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Name, description, and price are required' });
    }
    const product = await Product.create({
      name,
      description,
      price,
      quantity: quantity || 1,
      category: category || '',
      createdBy: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : ''
    });
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products  -> list all
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('createdBy', 'name email');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/products/:id  -> update (owner or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // allow only owner or admin
    if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updates = req.body;
    Object.assign(product, updates);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/products/:id  -> delete (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await product.remove();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
