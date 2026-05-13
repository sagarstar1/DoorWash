const express = require('express');
const router = express.Router();
const { getPackages, getPackage, createPackage, updatePackage, deletePackage } = require('../controllers/packageController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getPackages);
router.get('/:id', getPackage);
router.post('/', protect, authorize('admin'), upload.single('image'), createPackage);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updatePackage);
router.delete('/:id', protect, authorize('admin'), deletePackage);

module.exports = router;
