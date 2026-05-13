const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Razorpay fields ──
    razorpayOrderId:   { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    amount:   { type: Number, required: true }, // in paise (₹100 = 10000)
    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },

    method: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "emi", ""],
      default: "",
    },

    // ── Refund ──
    refundId:     { type: String },
    refundAmount: { type: Number },
    refundReason: { type: String },
    refundedAt:   { type: Date },

    receiptUrl: { type: String },
    paidAt:     { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
