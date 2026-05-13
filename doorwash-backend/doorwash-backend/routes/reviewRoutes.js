const express = require('express');
const router = express.Router();
const { createReview, getWorkerReviews, getAllReviews, replyToReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/', protect, authorize('customer'), upload.array('photos', 5), createReview);
router.get('/worker/:workerId', getWorkerReviews);
router.get('/', protect, authorize('admin'), getAllReviews);
router.put('/:id/reply', protect, authorize('admin'), replyToReview);

module.exports = router;
