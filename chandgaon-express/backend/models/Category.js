const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameBn: { type: String, required: true },
  icon: { type: String, default: '🛒' },
  image: { type: String, default: '' },
  slug: { type: String, required: true, unique: true, lowercase: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
