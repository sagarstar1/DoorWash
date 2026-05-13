const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Package = require('../models/Package');
const mongoose = require('mongoose');

// @desc   Admin analytics dashboard
// @route  GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers, totalWorkers, totalBookings,
      todayBookings, monthBookings, revenueToday,
      revenueMonth, revenueTotal, pendingBookings,
      completedBookings, cancelledBookings,
      revenueByDay, bookingsByStatus, topWorkers,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'worker', isApproved: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ createdAt: { $gte: today } }),
      Booking.countDocuments({ createdAt: { $gte: monthStart } }),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } },
      ]),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } },
      ]),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } },
      ]),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      // Revenue per day (last 30 days)
      Booking.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: last30 } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$finalAmount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Bookings by status
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Top rated workers
      User.find({ role: 'worker', isApproved: true })
        .select('name avatar rating totalRatings totalEarnings')
        .sort({ rating: -1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      analytics: {
        users: { customers: totalCustomers, workers: totalWorkers },
        bookings: {
          total: totalBookings,
          today: todayBookings,
          month: monthBookings,
          pending: pendingBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },
        revenue: {
          today: revenueToday[0]?.total || 0,
          month: revenueMonth[0]?.total || 0,
          total: revenueTotal[0]?.total || 0,
        },
        charts: {
          revenueByDay,
          bookingsByStatus,
        },
        topWorkers,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin: Get all users
// @route  GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
    const users = await User.find(filter)
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ success: true, total, users });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin: Update user (block/unblock, change role)
// @route  PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const allowed = ['isVerified', 'isApproved', 'isAvailable', 'role'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin: Delete user
// @route  DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};
