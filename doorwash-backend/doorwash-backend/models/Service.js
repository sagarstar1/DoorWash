const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // e.g. "Basic Wash", "Premium Detail", "Full Interior + Exterior"
    description: { type: String, required: true },
    shortDescription: { type: String },

    category: {
      type: String,
      enum: ["exterior", "interior", "full_detail", "tyres", "engine"],
      required: true,
    },

    // Pricing per vehicle type
    pricing: {
      hatchback:  { type: Number, required: true },
      sedan:      { type: Number, required: true },
      suv:        { type: Number, required: true },
      bike:       { type: Number, default: 0 },
      luxury:     { type: Number, required: true },
    },

    durationMinutes: { type: Number, required: true }, // estimated time
    includes: [{ type: String }], // ["Foam wash", "Tyre cleaning", "Dashboard wipe"]

    image: {
      public_id: String,
      url: { type: String, default: "" },
    },

    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
