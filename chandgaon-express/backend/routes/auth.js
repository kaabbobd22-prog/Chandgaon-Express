const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Otp = require('../models/Otp'); // নতুন ওটিপি মডেল ইমপোর্ট করা হলো
const { generateToken, protect } = require('../middleware/auth');
const { generateOTP, sendOTP } = require('../utils/sms');

// ==========================================
// @POST /api/auth/send-otp
// ==========================================
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'ফোন নম্বর দিন' });

    const otp = generateOTP();

    // ১. ওটিপি কালেকশন থেকে এই নম্বরের আগের সাময়িক রেকর্ড ডিলিট (কোনো ডুপ্লিকেট জটলা থাকবে না)
    await Otp.deleteMany({ phone });

    // ২. নতুন ওটিপি সাময়িক কালেকশনে সেভ করা হলো
    await Otp.create({ phone, otp });

    // ৩. চেক করুন ইউজার আগে থেকে আছে কি না। না থাকলে নতুন প্রোফাইল ক্রিয়েট হবে
    let user = await User.findOne({ phone });
    if (!user) {
      // ওটিপি ফিল্ডগুলো আর User মডেলে রাখার দরকার নেই, তাই এখান থেকে বাদ দেওয়া হলো
      user = await User.create({ name: 'নতুন ব্যবহারকারী', phone });
    }
    // ইউজার পুরনো হলে তার প্রোফাইলে আমরা হাতই দিব না, সব হিস্ট্রি ১০০% সুরক্ষিত থাকবে!

    // Send OTP SMS via Bulk SMS BD
    await sendOTP(phone, otp);

    // In development, return OTP in response
    const devOtp = process.env.NODE_ENV === 'development' ? { otp } : {};

    res.json({ success: true, message: 'OTP পাঠানো হয়েছে', ...devOtp });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ success: false, message: 'সার্ভারে সমস্যা হয়েছে', error: error.message });
  }
});

// ==========================================
// @POST /api/auth/verify-otp
// ==========================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'ফোন ও OTP দিন' });

    // ১. ওটিপি ম্যাচ করা হচ্ছে ডেডিকেটেড ওটিপি টেবিল থেকে
    const otpRecord = await Otp.findOne({ phone, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP সঠিক নয় অথবা মেয়াদ শেষ' });
    }

    // ২. ওটিপি মিলে গেলে ওটিপি টেবিল থেকে ভেরিফাইড কোডটি ডিলিট করে দেওয়া হলো
    await Otp.deleteOne({ _id: otpRecord._id });

    // ৩. ইউজার টেবিল থেকে কাস্টমারকে নিয়ে আসা
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });

    // ৪. টোকেন জেনারেট এবং ক্লিন প্রোফাইল রেসপন্স
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
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'সার্ভারে সমস্যা হয়েছে', error: error.message });
  }
});

// ==========================================
// @PUT /api/auth/profile - Update profile
// ==========================================
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, address } = req.body;
    
    // User মডেলে এখন আর ওটিপি ফিল্ড নেই, তাই এক্সক্লুড করার ঝামেলাও কমলো
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, address },
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// @GET /api/auth/me
// ==========================================
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ==========================================
// @POST /api/auth/admin/login
// ==========================================
router.post('/admin/create', async (req, res) => {
  try {
    // Only in dev — create first admin
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    const { phone, name } = req.body;
    const existing = await User.findOne({ role: 'admin' });
    if (existing) return res.status(400).json({ success: false, message: 'Admin already exists' });
    
    const admin = await User.create({ name: name || 'Admin', phone, role: 'admin' });
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;