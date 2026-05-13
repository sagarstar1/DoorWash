const Booking = require('../models/Booking');
const User = require('../models/User');
const Package = require('../models/Package');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const { bookingConfirmedEmail, workerAssignedEmail } = require('../utils/emailTemplates');

// @desc   Create booking
// @route  POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { packageId, vehicle, address, scheduledAt, notes, loyaltyPointsUse } = req.body;

    const pkg = await Package.findById(packageId);
    if (!pkg || !pkg.isActive)
      return res.status(404).json({ success: false, message: 'Package not found' });

    const customer = await User.findById(req.user.id);

    // Calculate pricing
    let amount = pkg.price;
    let discountAmount = 0;
    if (pkg.discountPercent > 0) {
      discountAmount = Math.floor((amount * pkg.discountPercent) / 100);
      amount -= discountAmount;
    }

    // Loyalty points (1 point = ₹1 off)
    let loyaltyPointsUsed = 0;
    if (loyaltyPointsUse && customer.loyaltyPoints > 0) {
      loyaltyPointsUsed = Math.min(loyaltyPointsUse, customer.loyaltyPoints, amount);
      amount -= loyaltyPointsUsed;
    }

    const booking = await Booking.create({
      customer: req.user.id,
      package: packageId,
      vehicle,
      address,
      scheduledAt,
      notes,
      amount: pkg.price,
      discountAmount,
      loyaltyPointsUsed,
      finalAmount: amount,
    });

    // Deduct loyalty points
    if (loyaltyPointsUsed > 0) {
      customer.loyaltyPoints -= loyaltyPointsUsed;
      await customer.save();
    }

    // Notification
    await Notification.create({
      user: req.user.id,
      title: 'Booking Placed',
      message: `Your ${pkg.name} booking for ${new Date(scheduledAt).toLocaleDateString('en-IN')} is confirmed.`,
      type: 'booking_confirmed',
      data: { bookingId: booking._id },
    });

    // Email
    sendEmail({
      to: customer.email,
      subject: 'DoorWash — Booking Confirmed',
      html: bookingConfirmedEmail(customer.name, booking._id, scheduledAt, pkg.name),
    }).catch(console.error);

    res.status(201).json({ success: true, booking: await booking.populate('package') });
  } catch (err) {
    next(err);
  }
};

// @desc   Get customer's bookings
// @route  GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { customer: req.user.id };
    if (status) filter.status = status;
    const bookings = await Booking.find(filter)
      .populate('package worker', 'name rating phone avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Booking.countDocuments(filter);
    res.json({ success: true, count: bookings.length, total, bookings });
  } catch (err) {
    next(err);
  }
};

// @desc   Get single booking
// @route  GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('package customer worker review');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    // Only customer, assigned worker, or admin
    if (
      booking.customer._id.toString() !== req.user.id &&
      (!booking.worker || booking.worker._id.toString() !== req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// @desc   Cancel booking
// @route  PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.customer.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (['completed', 'cancelled', 'in_progress'].includes(booking.status))
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` });

    booking.status = 'cancelled';
    await booking.save();

    // Refund loyalty points
    if (booking.loyaltyPointsUsed > 0) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { loyaltyPoints: booking.loyaltyPointsUsed } });
    }
    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) {
    next(err);
  }
};

// @desc   Worker: Get assigned bookings
// @route  GET /api/bookings/worker/assigned
exports.getWorkerBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { worker: req.user.id };
    if (status) filter.status = status;
    const bookings = await Booking.find(filter)
      .populate('package customer', 'name phone avatar')
      .sort({ scheduledAt: 1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

// @desc   Worker: Update booking status
// @route  PUT /api/bookings/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, workerNotes } = req.body;
    const booking = await Booking.findById(req.params.id).populate('customer package');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.worker.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    booking.status = status;
    if (workerNotes) booking.workerNotes = workerNotes;

    // When completed: add loyalty points (10 points per booking)
    if (status === 'completed') {
      await User.findByIdAndUpdate(booking.customer._id, { $inc: { loyaltyPoints: 10 } });
      // Notify customer to review
      await Notification.create({
        user: booking.customer._id,
        title: 'Wash Complete!',
        message: 'Your car is sparkling clean. How was the service?',
        type: 'review_request',
        data: { bookingId: booking._id },
      });
    }

    await booking.save();

    // Emit real-time status update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`booking_${booking._id}`).emit('booking_status_update', {
        bookingId: booking._id,
        status: booking.status,
        workerNotes: booking.workerNotes,
      });
    }

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin: Get all bookings
// @route  GET /api/bookings/admin/all
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.scheduledAt = {};
      if (from) filter.scheduledAt.$gte = new Date(from);
      if (to) filter.scheduledAt.$lte = new Date(to);
    }
    const bookings = await Booking.find(filter)
      .populate('customer worker package', 'name phone email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Booking.countDocuments(filter);
    res.json({ success: true, count: bookings.length, total, bookings });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin: Assign worker to booking
// @route  PUT /api/bookings/:id/assign
exports.assignWorker = async (req, res, next) => {
  try {
    const { workerId } = req.body;
    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'worker')
      return res.status(400).json({ success: false, message: 'Invalid worker' });

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { worker: workerId, status: 'worker_assigned' },
      { new: true }
    ).populate('customer package');

    // Notify customer
    const io = req.app.get('io');
    if (io) io.to(`user_${booking.customer._id}`).emit('worker_assigned', { booking, worker });

    sendEmail({
      to: booking.customer.email,
      subject: 'DoorWash — Worker Assigned',
      html: workerAssignedEmail(booking.customer.name, worker.name, worker.phone, 'As per scheduled time'),
    }).catch(console.error);

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};
