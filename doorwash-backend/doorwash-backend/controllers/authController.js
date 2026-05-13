const User = require('../models/User');
const { generateOTP, sendOTP } = require('../utils/sendOTP');
const sendEmail = require('../utils/sendEmail');

// Send response with token cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };
  user.password = undefined;
  user.otp = undefined;
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user,
  });
};

// @desc   Register customer
// @route  POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const user = await User.create({ name, email, phone, password, role: 'customer' });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc   Login with email + password
// @route  POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc   Send OTP to phone
// @route  POST /api/auth/send-otp
exports.sendOTPToPhone = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, name: 'DoorWash User', email: `${phone}@doorwash.temp`, otp, otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    }

    await sendOTP(phone, otp);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc   Verify OTP
// @route  POST /api/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone }).select('+otp +otpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.otp !== otp || user.otpExpiry < Date.now())
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('subscriptionPlan');
  res.json({ success: true, user });
};

// @desc   Logout
// @route  GET /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 5 * 1000), httpOnly: true });
  res.json({ success: true, message: 'Logged out' });
};

// @desc   Update profile
// @route  PUT /api/auth/update-profile
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    const allowed = ['name', 'email', 'fcmToken'];
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (req.file) updates.avatar = req.file.path;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc   Add vehicle
// @route  POST /api/auth/vehicle
exports.addVehicle = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.vehicles.push(req.body);
    await user.save();
    res.json({ success: true, vehicles: user.vehicles });
  } catch (err) {
    next(err);
  }
};
