const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');
const { generateOTP, sendOTP } = require('../utils/sms');

// @POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'ফোন নম্বর দিন' });

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_IN) || 5) * 60 * 1000);

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ name: 'নতুন ব্যবহারকারী', phone, otp, otpExpiry });
  } else {
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
  }

  // Send OTP SMS
  await sendOTP(phone, otp);

  // In development, return OTP in response
  const devOtp = process.env.NODE_ENV === 'development' ? { otp } : {};

  res.json({ success: true, message: 'OTP পাঠানো হয়েছে', ...devOtp });
});

// @POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ success: false, message: 'ফোন ও OTP দিন' });

  const user = await User.findOne({ phone });
  if (!user) return res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });

  if (user.otp !== otp) return res.status(400).json({ success: false, message: 'OTP সঠিক নয়' });
  if (user.otpExpiry < new Date()) return res.status(400).json({ success: false, message: 'OTP মেয়াদ শেষ' });

  // Clear OTP
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const token = generateToken(user._id);
  res.json({
    success: true,
    message: 'লগইন সফল',
    token,
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      address: user.address,
    },
  });
});

// @PUT /api/auth/profile - Update profile
router.put('/profile', protect, async (req, res) => {
  const { name, address } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, address },
    { new: true, runValidators: true }
  ).select('-otp -otpExpiry');
  res.json({ success: true, user });
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @POST /api/auth/admin/login - Admin phone+OTP login
router.post('/admin/create', async (req, res) => {
  // Only in dev — create first admin
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ success: false, message: 'Not allowed' });
  }
  const { phone, name } = req.body;
  const existing = await User.findOne({ role: 'admin' });
  if (existing) return res.status(400).json({ success: false, message: 'Admin already exists' });
  const admin = await User.create({ name: name || 'Admin', phone, role: 'admin' });
  res.json({ success: true, admin });
});

module.exports = router;
