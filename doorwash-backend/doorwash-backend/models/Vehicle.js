const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nickname: { type: String, trim: true }, // "My Swift", "Dad's Fortuner"
    brand:    { type: String, required: true },
    model:    { type: String, required: true },
    year:     { type: Number },
    color:    { type: String },
    plateNumber: { type: String, required: true, uppercase: true, trim: true },
    type: {
      type: String,
      enum: ["hatchback", "sedan", "suv", "bike", "luxury"],
      required: true,
    },
    image: {
      public_id: String,
      url: { type: String, default: "" },
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
