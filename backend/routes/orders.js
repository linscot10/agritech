// routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// POST /api/orders  -> place new order (buyer)
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product and quantity required' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (quantity > product.quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    const totalPrice = product.price * quantity;

    const order = await Order.create({
      product: productId,
      buyer: req.user._id,
      quantity,
      totalPrice
    });

    // reduce stock
    product.quantity -= quantity;
    await product.save();

    res.status(201).json(order);
  } catch (err) {
    console.error('Order create error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/orders  -> buyer sees own orders, admin sees all
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      filter = { buyer: req.user._id };
    }
    const orders = await Order.find(filter)
      .populate('product', 'name price')
      .populate('buyer', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/orders/:id -> buyer sees own, admin sees all
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('product', 'name price')
      .populate('buyer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role !== 'admin' && order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/orders/:id/status -> admin updates order status
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('product', 'name price')
     .populate('buyer', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/orders/:id -> buyer can cancel pending order
router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role !== 'admin' && order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    // restore stock
    const product = await Product.findById(order.product);
    if (product) {
      product.quantity += order.quantity;
      await product.save();
    }

    await order.remove();
    res.json({ message: 'Order cancelled & deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
