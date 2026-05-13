const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, webhook, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', webhook);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
