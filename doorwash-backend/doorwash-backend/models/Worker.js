const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: {
      public_id: String,
      url: { type: String, default: "" },
    },

    // ── Current location (updated via socket in real-time) ──
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    isOnline: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // ── Assigned service zones / cities ──
    serviceCities: [{ type: String }],

    // ── Rating & earnings ──
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalJobsCompleted: { type: Number, default: 0 },

    // ── Documents ──
    idProof: {
      public_id: String,
      url: String,
    },

    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },

    fcmToken: String,
    socketId: String, // updated on each connection
  },
  { timestamps: true }
);

workerSchema.index({ location: "2dsphere" }); // geo queries

workerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

workerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Worker", workerSchema);
