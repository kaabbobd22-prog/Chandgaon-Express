const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User  = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('rider'));

// @GET /api/delivery/queue - New orders waiting for pickup
router.get('/queue', async (req, res) => {
  const orders = await Order.find({ status: 'confirmed', rider: null })
    .populate('customer','name phone')
    .populate('shop','name address phone')
    .sort('createdAt');
  res.json({ success: true, orders });
});

// @GET /api/delivery/my-orders - Rider's active deliveries
router.get('/my-orders', async (req, res) => {
  const { status } = req.query;
  const query = { rider: req.user._id };
  if (status) query.status = status;
  const orders = await Order.find(query)
    .populate('customer','name phone')
    .populate('shop','name address phone')
    .sort('-createdAt');
  res.json({ success: true, orders });
});

// @PUT /api/delivery/accept/:orderId - Rider accepts order
router.put('/accept/:orderId', async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.rider) return res.status(400).json({ success: false, message: 'Order already assigned' });

  order.rider = req.user._id;
  order.status = 'picked';
  order.timeline.push({ status: 'picked', note: 'Rider picked up the order' });
  await order.save();

  const io = req.app.get('io');
  io.to(`order_${order._id}`).emit('order_update', { status: 'picked' });
  io.to('admin_room').emit('order_update', { status: 'picked', orderId: order._id });

  res.json({ success: true, order });
});

// @PUT /api/delivery/complete/:orderId - Mark delivered & COD collected
router.put('/complete/:orderId', async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (String(order.rider) !== String(req.user._id))
    return res.status(403).json({ success: false, message: 'Not your order' });

  order.status = 'delivered';
  order.codCollected = true;
  order.codAmount = order.totalAmount;
  order.timeline.push({ status: 'delivered', note: 'Delivered & cash collected' });
  await order.save();

  // Update rider financials
  await User.findByIdAndUpdate(req.user._id, {
    $inc: {
      'riderInfo.totalDelivered': 1,
      'riderInfo.totalCollected': order.totalAmount,
      'riderInfo.dueToPay':      order.totalAmount,
    },
  });

  const io = req.app.get('io');
  io.to(`order_${order._id}`).emit('order_update', { status: 'delivered' });
  io.to('admin_room').emit('order_delivered', { orderId: order._id, amount: order.totalAmount });

  res.json({ success: true, order });
});

// @GET /api/delivery/earnings - Rider's earning summary
router.get('/earnings', async (req, res) => {
  const rider = await User.findById(req.user._id).select('riderInfo name phone');
  const today = new Date(); today.setHours(0,0,0,0);

  const [todayDeliveries, allDeliveries] = await Promise.all([
    Order.find({ rider: req.user._id, status:'delivered', updatedAt:{ $gte: today } }),
    Order.find({ rider: req.user._id, status:'delivered' })
      .populate('customer','name phone').populate('shop','name').sort('-updatedAt').limit(20),
  ]);

  const todayAmount = todayDeliveries.reduce((s,o) => s + o.totalAmount, 0);

  res.json({
    success: true,
    summary: {
      todayDeliveries: todayDeliveries.length,
      todayAmount,
      totalDelivered: rider.riderInfo.totalDelivered,
      totalCollected: rider.riderInfo.totalCollected,
      totalPaidToAdmin: rider.riderInfo.totalPaidToAdmin,
      dueToPay: rider.riderInfo.dueToPay,
    },
    recentOrders: allDeliveries,
  });
});

// @PUT /api/delivery/toggle-online
router.put('/toggle-online', async (req, res) => {
  const rider = await User.findById(req.user._id);
  rider.riderInfo.isOnline = !rider.riderInfo.isOnline;
  await rider.save();
  res.json({ success: true, isOnline: rider.riderInfo.isOnline });
});

module.exports = router;
