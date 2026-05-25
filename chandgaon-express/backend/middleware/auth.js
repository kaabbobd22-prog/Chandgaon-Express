const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'অনুগ্রহ করে লগইন করুন' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-otp -otpExpiry');
    if (!req.user) return res.status(401).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
    if (!req.user.isActive) return res.status(403).json({ success: false, message: 'অ্যাকাউন্ট নিষ্ক্রিয়' });
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'অবৈধ টোকেন' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'এই কাজের অনুমতি নেই' });
  }
  next();
};

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

module.exports = { protect, authorize, generateToken };
