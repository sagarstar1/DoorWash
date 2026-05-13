const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getBooking, cancelBooking,
  getWorkerBookings, updateStatus, getAllBookings, assignWorker,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createBooking);
router.get('/my', protect, authorize('customer'), getMyBookings);
router.get('/worker/assigned', protect, authorize('worker'), getWorkerBookings);
router.get('/admin/all', protect, authorize('admin'), getAllBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, authorize('customer'), cancelBooking);
router.put('/:id/status', protect, authorize('worker', 'admin'), updateStatus);
router.put('/:id/assign', protect, authorize('admin'), assignWorker);

module.exports = router;
