const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  vehicle: {
    type: { type: String, enum: ['car', 'suv', 'bike', 'truck'] },
    brand: String,
    model: String,
    plate: String,
    color: String,
  },
  address: {
    label: String,
    fullAddress: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  scheduledAt: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'worker_assigned', 'worker_on_the_way', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],
  amount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  loyaltyPointsUsed: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },
  paymentId: { type: String, default: '' },
  razorpayOrderId: { type: String, default: '' },
  notes: { type: String, default: '' },
  beforePhotos: [{ type: String }],
  afterPhotos: [{ type: String }],
  workerNotes: { type: String, default: '' },
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null },
  estimatedArrival: { type: Date, default: null },
}, { timestamps: true });

// Auto-push status history
bookingSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
