const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const shops = await Shop.find({ isActive: true }).populate('owner', 'name phone');
  res.json({ success: true, shops });
});

router.get('/:id', async (req, res) => {
  const shop = await Shop.findById(req.params.id).populate('owner', 'name phone');
  if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
  res.json({ success: true, shop });
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  const shop = await Shop.create(req.body);
  res.status(201).json({ success: true, shop });
});

router.put('/:id', protect, authorize('admin', 'shopOwner'), async (req, res) => {
  const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, shop });
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Shop.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Shop deactivated' });
});

module.exports = router;
