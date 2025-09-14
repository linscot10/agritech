// // routes/supplyChain.js
// const express = require('express');
// const router = express.Router();
// const Order = require('../models/Order');
// const { protect, admin } = require('../middleware/auth');

// // GET supply chain status for an order
// router.get('/:orderId', protect, async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.orderId);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     // Buyer or farmer or admin can view
//     if (
//       order.buyer.toString() !== req.user._id.toString() &&
//       order.farmer.toString() !== req.user._id.toString() &&
//       req.user.role !== 'admin'
//     ) {
//       return res.status(403).json({ message: "Not allowed" });
//     }

//     res.json({
//       success: true,
//       orderId: order._id,
//       supplyChain: order.supplyChain
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching supply chain status" });
//   }
// });

// // UPDATE supply chain status (admin or farmer)
// router.put('/:orderId', protect, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const validStatuses = ['PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const order = await Order.findById(req.params.orderId);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     // Only farmer who owns the produce OR admin can update
//     if (
//       order.farmer.toString() !== req.user._id.toString() &&
//       req.user.role !== 'admin'
//     ) {
//       return res.status(403).json({ message: "Not allowed" });
//     }

//     order.supplyChain = { status, updatedAt: new Date() };
//     await order.save();

//     res.json({ success: true, message: "Supply chain updated", supplyChain: order.supplyChain });
//   } catch (err) {
//     res.status(500).json({ message: "Error updating supply chain" });
//   }
// });

// module.exports = router;


// routes/supplyChain.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// GET supply chain + logistics details
router.get('/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Buyer, farmer, or admin can view
    if (
      order.buyer.toString() !== req.user._id.toString() &&
      order.farmer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json({
      success: true,
      orderId: order._id,
      supplyChain: order.supplyChain
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching supply chain" });
  }
});

// UPDATE supply chain + logistics details
router.put('/:orderId', protect, async (req, res) => {
  try {
    const { status, driver, vehicle, deliveryNotes } = req.body;
    const validStatuses = ['PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only farmer who owns the produce OR admin can update
    if (
      order.farmer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Update supply chain info
    if (status) order.supplyChain.status = status;
    if (driver) order.supplyChain.driver = driver;
    if (vehicle) order.supplyChain.vehicle = vehicle;
    if (deliveryNotes) order.supplyChain.deliveryNotes = deliveryNotes;

    order.supplyChain.updatedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: "Supply chain updated",
      supplyChain: order.supplyChain
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating supply chain" });
  }
});

module.exports = router;
