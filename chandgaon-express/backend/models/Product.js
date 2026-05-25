const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameBn: { type: String, default: '' },
  description: { type: String, default: '' },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'পিস' }, // কেজি, গ্রাম, লিটার, পিস
  unitValue: { type: String, default: '' }, // e.g. "500 gm", "1 kg"
  stock: { type: Number, default: 100, min: 0 },
  image: { type: String, default: '' },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalSold: { type: Number, default: 0 },
}, { timestamps: true });

// Text search index
productSchema.index({ name: 'text', nameBn: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
