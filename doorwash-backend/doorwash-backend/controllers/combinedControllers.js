// ════════════════════════════════════════════════════════════
// reviewController.js
// ════════════════════════════════════════════════════════════
const Review  = require("../models/Review");
const Booking = require("../models/Booking");

exports.createReview = async (req, res) => {
  const { bookingId, rating, comment, cleanlinessRating, punctualityRating, behaviourRating } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
  if (booking.customer.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: "Not your booking" });
  if (booking.status !== "completed")
    return res.status(400).json({ success: false, message: "Can only review completed bookings" });
  if (booking.isReviewed)
    return res.status(400).json({ success: false, message: "Already reviewed" });

  const review = await Review.create({
    booking:  bookingId,
    customer: req.user.id,
    worker:   booking.worker,
    service:  booking.service,
    rating, comment,
    cleanlinessRating, punctualityRating, behaviourRating,
  });

  booking.isReviewed = true;
  await booking.save();

  res.status(201).json({ success: true, review });
};

exports.getWorkerReviews = async (req, res) => {
  const reviews = await Review.find({ worker: req.params.workerId })
    .populate("customer", "name avatar")
    .populate("service",  "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
};

exports.getAllReviews = async (req, res) => {
  const reviews = await Review.find()
    .populate("customer", "name")
    .populate("worker",   "name")
    .populate("service",  "name")
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, reviews });
};

// ════════════════════════════════════════════════════════════
// serviceController.js
// ════════════════════════════════════════════════════════════
const Service = require("../models/Service");

exports.getAllServices = async (req, res) => {
  const services = await Service.find({ isActive: true }).sort({ sortOrder: 1 });
  res.json({ success: true, services });
};

exports.getService = async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.status(404).json({ success: false, message: "Service not found" });
  res.json({ success: true, service });
};

exports.createService = async (req, res) => {
  const service = await Service.create(req.body);
  res.status(201).json({ success: true, service });
};

exports.updateService = async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!service) return res.status(404).json({ success: false, message: "Service not found" });
  res.json({ success: true, service });
};

exports.deleteService = async (req, res) => {
  await Service.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: "Service deactivated" });
};

// ════════════════════════════════════════════════════════════
// vehicleController.js
// ════════════════════════════════════════════════════════════
const Vehicle = require("../models/Vehicle");

exports.addVehicle = async (req, res) => {
  const vehicle = await Vehicle.create({ ...req.body, owner: req.user.id });
  res.status(201).json({ success: true, vehicle });
};

exports.getMyVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user.id });
  res.json({ success: true, vehicles });
};

exports.updateVehicle = async (req, res) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    req.body,
    { new: true }
  );
  if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });
  res.json({ success: true, vehicle });
};

exports.deleteVehicle = async (req, res) => {
  await Vehicle.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  res.json({ success: true, message: "Vehicle removed" });
};

// ════════════════════════════════════════════════════════════
// workerController.js
// ════════════════════════════════════════════════════════════
const Worker   = require("../models/Worker");
const BookingM = require("../models/Booking");

exports.getWorkerProfile = async (req, res) => {
  const worker = await Worker.findById(req.user.id).select("-password");
  res.json({ success: true, worker });
};

exports.updateWorkerProfile = async (req, res) => {
  const allowed = ["name", "phone", "bankDetails", "fcmToken"];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const worker = await Worker.findByIdAndUpdate(req.user.id, updates, { new: true });
  res.json({ success: true, worker });
};

exports.getWorkerJobs = async (req, res) => {
  const { status } = req.query;
  const filter = { worker: req.user.id };
  if (status) filter.status = status;
  const jobs = await BookingM.find(filter)
    .populate("service", "name durationMinutes")
    .populate("vehicle", "brand model type plateNumber color")
    .populate("customer", "name phone")
    .sort({ scheduledAt: 1 });
  res.json({ success: true, jobs });
};

exports.toggleAvailability = async (req, res) => {
  const worker = await Worker.findById(req.user.id);
  worker.isAvailable = !worker.isAvailable;
  await worker.save();
  res.json({ success: true, isAvailable: worker.isAvailable });
};

// ════════════════════════════════════════════════════════════
// userController.js
// ════════════════════════════════════════════════════════════
const User = require("../models/User");

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ success: true, user });
};

exports.updateProfile = async (req, res) => {
  const allowed = ["name", "phone", "fcmToken"];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
  res.json({ success: true, user });
};

exports.addAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (req.body.isDefault) {
    user.address.forEach(a => (a.isDefault = false));
  }
  user.address.push(req.body);
  await user.save();
  res.json({ success: true, address: user.address });
};

exports.deleteAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  user.address = user.address.filter(a => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, address: user.address });
};

exports.getLoyaltyPoints = async (req, res) => {
  const user = await User.findById(req.user.id).select("loyaltyPoints totalWashes");
  res.json({ success: true, loyaltyPoints: user.loyaltyPoints, totalWashes: user.totalWashes });
};
