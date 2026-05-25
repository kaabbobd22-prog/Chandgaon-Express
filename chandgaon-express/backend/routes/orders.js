const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Shop = require('../models/Shop');
const { protect, authorize } = require('../middleware/auth');
const { sendOrderConfirmation, sendDeliveryAssigned } = require('../utils/sms');

// Delivery fee calculator
const calcDeliveryFee = (items) => {
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalKg = items.reduce((sum, i) => {
    if (i.unit?.includes('কেজি') || i.unit?.includes('kg')) return sum + i.quantity;
    return sum;
  }, 0);
  if (totalKg >= 50) return 100;
  if (totalKg >= 25) return 70;
  if (totalKg >= 10) return 50;
  if (totalQty > 3)  return 30;
  return 10;
};

// @POST /api/orders - Customer place order
router.post('/', protect, async (req, res) => {
  const { shopId, items, deliveryAddress, deliveryNote, customerPhone } = req.body;

  if (!items?.length) return res.status(400).json({ success: false, message: 'কার্ট খালি' });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = calcDeliveryFee(items);
  const totalAmount = subtotal + deliveryFee;

  const orderItems = items.map(i => ({
    product: i.product,
    name: i.name,
    image: i.image,
    price: i.price,
    unit: i.unit,
    quantity: i.quantity,
    subtotal: i.price * i.quantity,
  }));

  const order = await Order.create({
    customer: req.user._id,
    shop: shopId,
    items: orderItems,
    subtotal,
    deliveryFee,
    totalAmount,
    deliveryAddress,
    deliveryNote,
    customerPhone: customerPhone || req.user.phone,
    codAmount: totalAmount,
    timeline: [{ status: 'pending', note: 'অর্ডার দেওয়া হয়েছে' }],
  });

  await order.populate(['customer', 'shop']);

  // Update shop stats
  await Shop.findByIdAndUpdate(shopId, {
    $inc: { totalOrders: 1, totalRevenue: subtotal },
  });

  // Socket event to admin
  const io = req.app.get('io');
  io.to('admin_room').emit('new_order', { orderId: order._id, orderNumber: order.orderNumber, totalAmount });

  // Send SMS
  await sendOrderConfirmation(order.customerPhone, order.orderNumber, totalAmount);

  res.status(201).json({ success: true, order });
});

// @GET /api/orders - Get orders (role-based)
router.get('/', protect, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  let query = {};

  if (req.user.role === 'customer') query.customer = req.user._id;
  else if (req.user.role === 'rider') query.rider = req.user._id;
  else if (req.user.role === 'shopOwner') {
    const shops = await Shop.find({ owner: req.user._id }).select('_id');
    query.shop = { $in: shops.map(s => s._id) };
  }
  // admin sees all

  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('customer', 'name phone')
      .populate('shop', 'name')
      .populate('rider', 'name phone')
      .sort('-createdAt').skip(skip).limit(+limit),
    Order.countDocuments(query),
  ]);

  res.json({ success: true, orders, total, page: +page, pages: Math.ceil(total / limit) });
});

// @GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name phone address')
    .populate('shop', 'name phone address')
    .populate('rider', 'name phone');

  if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });
  res.json({ success: true, order });
});

// @PUT /api/orders/:id/status - Update order status
router.put('/:id/status', protect, async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });

  order.status = status;
  order.timeline.push({ status, note: note || '', time: new Date() });

  // If delivered, mark cod as collected
  if (status === 'delivered') {
    order.codCollected = true;
    // Update rider stats
    if (order.rider) {
      await User.findByIdAndUpdate(order.rider, {
        $inc: {
          'riderInfo.totalDelivered': 1,
          'riderInfo.totalCollected': order.totalAmount,
          'riderInfo.dueToPay': order.totalAmount,
        },
      });
    }
  }

  await order.save();

  const io = req.app.get('io');
  io.to(`order_${order._id}`).emit('order_update', { status, orderId: order._id });
  io.to('admin_room').emit('order_update', { status, orderId: order._id, orderNumber: order.orderNumber });

  res.json({ success: true, order });
});

// @PUT /api/orders/:id/assign-rider - Assign rider
router.put('/:id/assign-rider', protect, authorize('admin'), async (req, res) => {
  const { riderId } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { rider: riderId, status: 'preparing', $push: { timeline: { status: 'preparing', note: 'রাইডার অ্যাসাইন করা হয়েছে' } } },
    { new: true }
  ).populate('rider', 'name phone');

  const io = req.app.get('io');
  io.to(`rider_${riderId}`).emit('new_assignment', { orderId: order._id, orderNumber: order.orderNumber });
  io.to(`order_${order._id}`).emit('order_update', { status: 'preparing' });

  // SMS to customer
  await sendDeliveryAssigned(order.customerPhone, order.rider.name);

  res.json({ success: true, order });
});

// @PUT /api/orders/:id/rate - Customer rate order
router.put('/:id/rate', protect, async (req, res) => {
  const { rating, review } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { rating, review },
    { new: true }
  );
  res.json({ success: true, order });
});

module.exports = router;
