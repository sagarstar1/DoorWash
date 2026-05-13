const express = require('express');
const router = express.Router();
const { updateLocation, toggleAvailability, getWorkerStats, getAllWorkers, approveWorker } = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/auth');

router.put('/location', protect, authorize('worker'), updateLocation);
router.put('/availability', protect, authorize('worker'), toggleAvailability);
router.get('/stats', protect, authorize('worker'), getWorkerStats);
router.get('/', protect, authorize('admin'), getAllWorkers);
router.put('/:id/approve', protect, authorize('admin'), approveWorker);

module.exports = router;
