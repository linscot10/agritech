// routes/programs.js
const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const { protect } = require('../middleware/auth');

// CREATE program (admin/gov/ngo only)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only admin can create programs" });
    }

    const program = await Program.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, program });
  } catch (err) {
    res.status(500).json({ message: "Error creating program" });
  }
});

// GET all programs
router.get('/', protect, async (req, res) => {
  try {
    const programs = await Program.find().populate('createdBy', 'name email');
    res.json({ success: true, programs });
  } catch (err) {
    res.status(500).json({ message: "Error fetching programs" });
  }
});

// APPLY for a program (farmer)
router.post('/:programId/apply', protect, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: "Only farmers can apply" });
    }

    const program = await Program.findById(req.params.programId);
    if (!program) return res.status(404).json({ message: "Program not found" });

    const alreadyApplied = program.applicants.find(a => a.farmer.toString() === req.user._id.toString());
    if (alreadyApplied) return res.status(400).json({ message: "Already applied" });

    program.applicants.push({ farmer: req.user._id });
    await program.save();

    res.json({ success: true, message: "Applied successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error applying for program" });
  }
});

// UPDATE applicant status (admin only)
router.put('/:programId/applicants/:farmerId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only admin can update applications" });
    }

    const { status } = req.body;
    const validStatuses = ['APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const program = await Program.findById(req.params.programId);
    if (!program) return res.status(404).json({ message: "Program not found" });

    const applicant = program.applicants.find(a => a.farmer.toString() === req.params.farmerId);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });

    applicant.status = status;
    await program.save();

    res.json({ success: true, message: "Application updated", applicant });
  } catch (err) {
    res.status(500).json({ message: "Error updating application" });
  }
});

module.exports = router;
