const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: {
    type: String, required: true, unique: true, trim: true,
    match: [/^01[3-9]\d{8}$/, 'অবৈধ বাংলাদেশি ফোন নম্বর'],
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'rider', 'shopOwner'],
    default: 'customer',
  },
  address: { type: String, default: '' },
  isActive: { type: Boolean, default: true },

  // OTP
  otp: { type: String },
  otpExpiry: { type: Date },

  // Rider specific
  riderInfo: {
    totalDelivered: { type: Number, default: 0 },
    totalCollected: { type: Number, default: 0 }, // Cash collected from customers
    totalPaidToAdmin: { type: Number, default: 0 }, // Cash paid back to admin
    dueToPay: { type: Number, default: 0 }, // totalCollected - totalPaidToAdmin
    isOnline: { type: Boolean, default: false },
  },
}, { timestamps: true });

// Hash password if set
userSchema.pre('save', async function (next) {
  if (this.isModified('otp') && this.otp) {
    // Don't hash OTP, store plaintext for verification simplicity
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
