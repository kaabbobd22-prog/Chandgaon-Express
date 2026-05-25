const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: {
    type: String,
    enum: ['grocery', 'vegetable', 'bakery', 'pharmacy', 'meat', 'dairy', 'snacks', 'other'],
    required: true,
  },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  phone: { type: String },
  address: { type: String },
  commissionRate: { type: Number, default: 8, min: 0, max: 30 }, // percentage
  isActive: { type: Boolean, default: true },
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
