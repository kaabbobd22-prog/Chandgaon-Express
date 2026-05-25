const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    // এখানে unique: true দেওয়া যাবে না, কারণ একই নম্বরে বারবার ওটিপি রিকোয়েস্ট আসবে
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // ওটিপি ৫ মিনিট (৩০০ সেকেন্ড) পর ডাটাবেজ থেকে অটোমেটিক ডিলিট হয়ে যাবে (TTL Index)
  },
});

module.exports = mongoose.model('Otp', otpSchema);