const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  phone: { type: String, required: [true, 'Phone is required'], unique: true },
  password: { type: String, minlength: 6, select: false },
  role: { type: String, enum: ['customer', 'worker', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, select: false },
  otpExpiry: { type: Date, select: false },

  // Customer specific
  vehicles: [{
    type: { type: String, enum: ['car', 'suv', 'bike', 'truck'] },
    brand: String,
    model: String,
    plate: String,
    color: String,
  }],
  loyaltyPoints: { type: Number, default: 0 },
  savedAddresses: [{
    label: String,
    address: String,
    lat: Number,
    lng: Number,
  }],
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    default: null,
  },
  subscriptionExpiry: { type: Date, default: null },

  // Worker specific
  isAvailable: { type: Boolean, default: false },
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    updatedAt: { type: Date },
  },
  totalEarnings: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  documents: {
    idProof: { type: String, default: '' },
    addressProof: { type: String, default: '' },
  },
  isApproved: { type: Boolean, default: false },
  fcmToken: { type: String, default: '' },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model('User', userSchema);
