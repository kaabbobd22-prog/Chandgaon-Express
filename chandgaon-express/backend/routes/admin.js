const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

// @GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const week  = new Date(Date.now() - 7*24*60*60*1000);

  const [
    todayOrders, totalOrders, activeRiders,
    pendingOrders, totalRevenue, totalDue,
    totalPaid, recentOrders
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.countDocuments(),
    User.countDocuments({ role: 'rider', 'riderInfo.isOnline': true }),
    Order.countDocuments({ status: { $in: ['pending','confirmed','preparing','picked'] } }),
    Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    User.aggregate([{ $match: { role: 'rider' } }, { $group: { _id: null, due: { $sum: '$riderInfo.dueToPay' } } }]),
    User.aggregate([{ $match: { role: 'rider' } }, { $group: { _id: null, paid: { $sum: '$riderInfo.totalPaidToAdmin' } } }]),
    Order.find().populate('customer','name phone').populate('shop','name').populate('rider','name').sort('-createdAt').limit(10),
  ]);

  res.json({
    success: true,
    stats: {
      todayOrders,
      totalOrders,
      activeRiders,
      pendingOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalDue: totalDue[0]?.due || 0,
      totalPaid: totalPaid[0]?.paid || 0,
    },
    recentOrders,
  });
});

// @GET /api/admin/riders - All riders with COD summary
router.get('/riders', async (req, res) => {
  const riders = await User.find({ role: 'rider' }).select('-otp -otpExpiry');
  res.json({ success: true, riders });
});

// @GET /api/admin/riders/:id/orders
router.get('/riders/:id/orders', async (req, res) => {
  const orders = await Order.find({ rider: req.params.id })
    .populate('customer','name phone')
    .populate('shop','name')
    .sort('-createdAt');
  const rider = await User.findById(req.params.id).select('-otp -otpExpiry');
  res.json({ success: true, rider, orders });
});

// @POST /api/admin/riders/:id/mark-paid - Mark rider has paid admin
router.post('/riders/:id/mark-paid', async (req, res) => {
  const { amount } = req.body;
  const rider = await User.findById(req.params.id);
  if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

  const payAmount = Math.min(amount || rider.riderInfo.dueToPay, rider.riderInfo.dueToPay);

  rider.riderInfo.totalPaidToAdmin += payAmount;
  rider.riderInfo.dueToPay -= payAmount;
  await rider.save();

  // Mark associated orders as paid
  await Order.updateMany(
    { rider: rider._id, codCollected: true, codPaidToAdmin: false },
    { codPaidToAdmin: true, codPaidAt: new Date() }
  );

  res.json({ success: true, message: `Marked ৳${payAmount} paid`, rider });
});

// @GET /api/admin/orders - All orders with filters
router.get('/orders', async (req, res) => {
  const { status, from, to, rider, page=1, limit=25 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (rider)  query.rider = rider;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to)   query.createdAt.$lte = new Date(to);
  }
  const skip = (page-1)*limit;
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('customer','name phone')
      .populate('shop','name')
      .populate('rider','name phone')
      .sort('-createdAt').skip(skip).limit(+limit),
    Order.countDocuments(query),
  ]);
  res.json({ success: true, orders, total, page:+page, pages: Math.ceil(total/limit) });
});

// @POST /api/admin/riders - Create rider account
router.post('/riders', async (req, res) => {
  const { name, phone } = req.body;
  const existing = await User.findOne({ phone });
  if (existing) {
    existing.role = 'rider';
    await existing.save();
    return res.json({ success: true, rider: existing });
  }
  const rider = await User.create({ name, phone, role: 'rider' });
  res.status(201).json({ success: true, rider });
});

// @GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  const last7 = await Order.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now()-7*24*60*60*1000) }, status: 'delivered' } },
    { $group: { _id: { $dateToString: { format:'%Y-%m-%d', date:'$createdAt' } }, count: { $sum:1 }, revenue: { $sum:'$totalAmount' } } },
    { $sort: { _id: 1 } },
  ]);
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id:'$items.name', count:{ $sum:'$items.quantity' }, revenue:{ $sum:'$items.subtotal' } } },
    { $sort: { count:-1 } }, { $limit: 5 },
  ]);
  res.json({ success: true, last7, topProducts });
});

module.exports = router;
