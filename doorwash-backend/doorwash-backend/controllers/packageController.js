const Package = require('../models/Package');

// @desc   Get all active packages
// @route  GET /api/packages
exports.getPackages = async (req, res, next) => {
  try {
    const { vehicleType, tier } = req.query;
    const filter = { isActive: true };
    if (vehicleType) filter.vehicleTypes = vehicleType;
    if (tier) filter.tier = tier;
    const packages = await Package.find(filter).sort({ price: 1 });
    res.json({ success: true, count: packages.length, packages });
  } catch (err) {
    next(err);
  }
};

// @desc   Get single package
// @route  GET /api/packages/:id
exports.getPackage = async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, package: pkg });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin: Create package
// @route  POST /api/packages
exports.createPackage = async (req, res, next) => {
  try {
    if (req.file) req.body.image = req.file.path;
    const pkg = await Package.create(req.body);
    res.status(201).json({ success: true, package: pkg });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin: Update package
// @route  PUT /api/packages/:id
exports.updatePackage = async (req, res, next) => {
  try {
    if (req.file) req.body.image = req.file.path;
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, package: pkg });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin: Delete (deactivate) package
// @route  DELETE /api/packages/:id
exports.deletePackage = async (req, res, next) => {
  try {
    await Package.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Package deactivated' });
  } catch (err) {
    next(err);
  }
};
