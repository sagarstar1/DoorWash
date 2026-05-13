const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true, comment: 'in minutes' },
  vehicleTypes: [{ type: String, enum: ['car', 'suv', 'bike', 'truck'] }],
  services: [{ type: String }],
  isSubscription: { type: Boolean, default: false },
  subscriptionDays: { type: Number, default: 30 },
  subscriptionWashes: { type: Number, default: 4 },
  tier: { type: String, enum: ['basic', 'premium', 'luxury'], default: 'basic' },
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  discountPercent: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
