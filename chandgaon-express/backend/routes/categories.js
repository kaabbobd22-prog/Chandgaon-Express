const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const cats = await Category.find({ isActive: true }).sort('sortOrder');
  res.json({ success: true, categories: cats });
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json({ success: true, category: cat });
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, category: cat });
});

module.exports = router;
