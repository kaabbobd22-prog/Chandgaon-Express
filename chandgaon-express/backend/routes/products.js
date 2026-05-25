const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/products - Get all (with filters)
router.get('/', async (req, res) => {
  const { category, shop, search, featured, page = 1, limit = 20 } = req.query;
  const query = { isActive: true };

  if (category) query.category = category;
  if (shop)     query.shop = shop;
  if (featured) query.isFeatured = true;
  if (search)   query.$text = { $search: search };

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(query).populate('shop', 'name category').sort('-createdAt').skip(skip).limit(+limit),
    Product.countDocuments(query),
  ]);

  res.json({ success: true, products, total, page: +page, pages: Math.ceil(total / limit) });
});

// @GET /api/products/:id
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('shop', 'name category address phone');
  if (!product) return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি' });
  res.json({ success: true, product });
});

// @POST /api/products - Admin/ShopOwner create
router.post('/', protect, authorize('admin', 'shopOwner'), async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @PUT /api/products/:id
router.put('/:id', protect, authorize('admin', 'shopOwner'), async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি' });
  res.json({ success: true, product });
});

// @DELETE /api/products/:id
router.delete('/:id', protect, authorize('admin', 'shopOwner'), async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'পণ্য মুছে ফেলা হয়েছে' });
});

module.exports = router;
