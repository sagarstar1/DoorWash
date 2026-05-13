const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc   Update worker live location
// @route  PUT /api/workers/location
exports.updateLocation = async (req, res, next) => {
  try {
    const { lat, lng, bookingId } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      'currentLocation.lat': lat,
      'currentLocation.lng': lng,
      'currentLocation.updatedAt': new Date(),
    });

    // Broadcast location to customer watching this booking
    const io = req.app.get('io');
    if (io && bookingId) {
      io.to(`booking_${bookingId}`).emit('worker_location_update', {
        lat, lng, workerId: req.user.id, bookingId,
      });
    }

    res.json({ success: true, message: 'Location updated' });
  } catch (err) {
    next(err);
  }
};

// @desc   Toggle availability
// @route  PUT /api/workers/availability
exports.toggleAvailability = async (req, res, next) => {
  try {
    const worker = await User.findById(req.user.id);
    worker.isAvailable = !worker.isAvailable;
    await worker.save();
    res.json({ success: true, isAvailable: worker.isAvailable });
  } catch (err) {
    next(err);
  }
};

// @desc   Get worker dashboard stats
// @route  GET /api/workers/stats
exports.getWorkerStats = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalCompleted, todayCompleted, totalEarnings, worker] = await Promise.all([
      Booking.countDocuments({ worker: workerId, status: 'completed' }),
      Booking.countDocuments({ worker: workerId, status: 'completed', updatedAt: { $gte: today } }),
      Booking.aggregate([
        { $match: { worker: require('mongoose').Types.ObjectId(workerId), status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } },
      ]),
      User.findById(workerId).select('rating totalRatings isAvailable'),
    ]);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyEarnings = await Booking.aggregate([
      { $match: { worker: require('mongoose').Types.ObjectId(workerId), status: 'completed', updatedAt: { $gte: weekAgo } } },
      { $group: { _id: { $dayOfWeek: '$updatedAt' }, amount: { $sum: '$finalAmount' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalCompleted,
        todayCompleted,
        totalEarnings: totalEarnings[0]?.total || 0,
        rating: worker.rating,
        totalRatings: worker.totalRatings,
        isAvailable: worker.isAvailable,
        weeklyEarnings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin: Get all workers
// @route  GET /api/workers
exports.getAllWorkers = async (req, res, next) => {
  try {
    const { isAvailable, isApproved } = req.query;
    const filter = { role: 'worker' };
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    const workers = await User.find(filter).select('-password -otp -otpExpiry');
    res.json({ success: true, count: workers.length, workers });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin: Approve worker
// @route  PUT /api/workers/:id/approve
exports.approveWorker = async (req, res, next) => {
  try {
    const worker = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    res.json({ success: true, worker });
  } catch (err) {
    next(err);
  }
};
