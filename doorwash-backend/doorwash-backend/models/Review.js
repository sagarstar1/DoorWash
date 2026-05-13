const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
  photos: [{ type: String }],
  isVerified: { type: Boolean, default: true },
  reply: {
    text: String,
    repliedAt: Date,
  },
}, { timestamps: true });

// Update worker average rating after review save
reviewSchema.post('save', async function () {
  const Review = this.constructor;
  const User = mongoose.model('User');
  const stats = await Review.aggregate([
    { $match: { worker: this.worker } },
    { $group: { _id: '$worker', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await User.findByIdAndUpdate(this.worker, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalRatings: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
