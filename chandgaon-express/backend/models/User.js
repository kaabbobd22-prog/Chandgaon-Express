const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    default: 'নতুন ব্যবহারকারী' // নতুন ইউজারের জন্য ডিফল্ট নাম সেট করা হলো
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^01[3-9]\d{8}$/, 'অবৈধ বাংলাদেশি ফোন নম্বর'], // ১১ ডিজিটের বিডি নাম্বার ফরম্যাট
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'rider', 'shopOwner'],
    default: 'customer',
  },
  address: { type: String, default: '' },
  isActive: { type: Boolean, default: true },

  // 🛠️ ওটিপি ফিল্ড দুটি এখান থেকে সম্পূর্ণ সরিয়ে দেওয়া হলো (কারণ এগুলো এখন Otp.js মডেলে আছে)

  // Rider specific
  riderInfo: {
    totalDelivered: { type: Number, default: 0 },
    totalCollected: { type: Number, default: 0 }, // Cash collected from customers
    totalPaidToAdmin: { type: Number, default: 0 }, // Cash paid back to admin
    dueToPay: { type: Number, default: 0 }, // totalCollected - totalPaidToAdmin
    isOnline: { type: Boolean, default: false },
  },
}, { timestamps: true });

// 🛠️ অপ্রয়োজনীয় ওটিপি প্রি-সেভ হুকটি ফেলে দেওয়া হলো

module.exports = mongoose.model('User', userSchema);