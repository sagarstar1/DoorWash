const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc   Create review
// @route  POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.customer.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not your booking' });
    if (booking.status !== 'completed')
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    if (booking.review)
      return res.status(400).json({ success: false, message: 'Already reviewed' });

    const photos = req.files ? req.files.map(f => f.path) : [];

    const review = await Review.create({
      booking: bookingId,
      customer: req.user.id,
      worker: booking.worker,
      rating,
      comment,
      photos,
    });

    booking.review = review._id;
    await booking.save();

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

// @desc   Get reviews for a worker
// @route  GET /api/reviews/worker/:workerId
exports.getWorkerReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Review.countDocuments({ worker: req.params.workerId });
    res.json({ success: true, total, reviews });
  } catch (err) {
    next(err);
  }
};

// @desc   Get all reviews (admin)
// @route  GET /api/reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, minRating } = req.query;
    const filter = {};
    if (minRating) filter.rating = { $gte: Number(minRating) };
    const reviews = await Review.find(filter)
      .populate('customer worker', 'name avatar')
      .populate('booking', 'scheduledAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Review.countDocuments(filter);
    res.json({ success: true, total, reviews });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin reply to review
// @route  PUT /api/reviews/:id/reply
exports.replyToReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { reply: { text: req.body.text, repliedAt: new Date() } },
      { new: true }
    );
    res.json({ success: true, review });
  } catch (err) {
    next(err);
  }
};
