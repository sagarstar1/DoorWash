const express = require('express');
const router = express.Router();
const { register, login, sendOTPToPhone, verifyOTP, getMe, logout, updateProfile, addVehicle } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], validate, login);

router.post('/send-otp', body('phone').notEmpty(), validate, sendOTPToPhone);
router.post('/verify-otp', [
  body('phone').notEmpty(),
  body('otp').isLength({ min: 6, max: 6 }),
], validate, verifyOTP);

router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/update-profile', protect, upload.single('avatar'), updateProfile);
router.post('/vehicle', protect, addVehicle);

module.exports = router;
