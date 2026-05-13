const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @desc   Create Razorpay order
// @route  POST /api/payments/create-order
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.customer.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const options = {
      amount: Math.round(booking.finalAmount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
      notes: { bookingId: bookingId.toString(), customerId: req.user.id },
    };

    const order = await razorpay.orders.create(options);
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      booking: { id: booking._id, amount: booking.finalAmount },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Verify payment signature & confirm booking
// @route  POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Signature verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'paid',
        paymentId: razorpay_payment_id,
        status: 'confirmed',
      },
      { new: true }
    ).populate('package customer');

    await Notification.create({
      user: booking.customer._id,
      title: 'Payment Successful',
      message: `₹${booking.finalAmount} paid for ${booking.package.name}. Your booking is confirmed!`,
      type: 'payment_success',
      data: { bookingId: booking._id },
    });

    res.json({ success: true, message: 'Payment verified', booking });
  } catch (err) {
    next(err);
  }
};

// @desc   Razorpay webhook
// @route  POST /api/payments/webhook
exports.webhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature)
      return res.status(400).json({ success: false });

    const event = req.body.event;
    if (event === 'payment.failed') {
      const orderId = req.body.payload.payment.entity.order_id;
      await Booking.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { paymentStatus: 'failed' }
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// @desc   Get payment history
// @route  GET /api/payments/history
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      customer: req.user.id,
      paymentStatus: 'paid',
    })
      .populate('package', 'name tier')
      .select('finalAmount paymentId createdAt package status')
      .sort({ createdAt: -1 });

    const total = bookings.reduce((sum, b) => sum + b.finalAmount, 0);
    res.json({ success: true, total, bookings });
  } catch (err) {
    next(err);
  }
};
