const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  unit: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  items: [orderItemSchema],

  // Pricing
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true },

  // Delivery
  deliveryAddress: { type: String, required: true },
  customerPhone: { type: String, required: true },
  deliveryNote: { type: String, default: '' },

  // Status flow: pending → confirmed → preparing → picked → delivered | cancelled
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'picked', 'delivered', 'cancelled'],
    default: 'pending',
  },

  // COD - Cash on Delivery tracking
  paymentMethod: { type: String, default: 'cod' },
  codAmount: { type: Number, default: 0 },         // Actual cash collected from customer
  codCollected: { type: Boolean, default: false },  // Did rider collect cash?
  codPaidToAdmin: { type: Boolean, default: false },// Did rider pay admin?
  codPaidAt: { type: Date },

  // Status timeline
  timeline: [{
    status: String,
    time: { type: Date, default: Date.now },
    note: String,
  }],

  cancelReason: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `CE-${String(count + 1).padStart(4, '0')}`;
  }
  // Auto-set COD amount
  if (!this.codAmount) this.codAmount = this.totalAmount;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
