// ════════════════════════════════════════════════════════════
// routes/paymentRoutes.js
// ════════════════════════════════════════════════════════════
const express = require("express");
const router  = express.Router();
const { createOrder, verifyPayment, webhook, refund, getPaymentByBooking } = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/auth");

router.post("/webhook", express.raw({ type: "application/json" }), webhook);
router.use(protect);
router.post("/create-order",         authorize("customer"), createOrder);
router.post("/verify",               authorize("customer"), verifyPayment);
router.post("/refund",               authorize("admin"),    refund);
router.get("/booking/:bookingId",                           getPaymentByBooking);

module.exports = router;

// ════════════════════════════════════════════════════════════
// routes/serviceRoutes.js
// ════════════════════════════════════════════════════════════
const sRouter = require("express").Router();
const { getAllServices, getService, createService, updateService, deleteService } = require("../controllers/combinedControllers");
const sAuth = require("../middleware/auth");

sRouter.get("/",         getAllServices);
sRouter.get("/:id",      getService);
sRouter.post("/",        sAuth.protect, sAuth.authorize("admin"), createService);
sRouter.put("/:id",      sAuth.protect, sAuth.authorize("admin"), updateService);
sRouter.delete("/:id",   sAuth.protect, sAuth.authorize("admin"), deleteService);
module.exports = { serviceRouter: sRouter };

// ════════════════════════════════════════════════════════════
// routes/vehicleRoutes.js
// ════════════════════════════════════════════════════════════
const vRouter = require("express").Router();
const { addVehicle, getMyVehicles, updateVehicle, deleteVehicle } = require("../controllers/combinedControllers");
const vAuth = require("../middleware/auth");

vRouter.use(vAuth.protect, vAuth.authorize("customer"));
vRouter.post("/",        addVehicle);
vRouter.get("/",         getMyVehicles);
vRouter.put("/:id",      updateVehicle);
vRouter.delete("/:id",   deleteVehicle);
module.exports = { vehicleRouter: vRouter };

// ════════════════════════════════════════════════════════════
// routes/workerRoutes.js
// ════════════════════════════════════════════════════════════
const wRouter = require("express").Router();
const { getWorkerProfile, updateWorkerProfile, getWorkerJobs, toggleAvailability } = require("../controllers/combinedControllers");
const wAuth = require("../middleware/auth");

wRouter.use(wAuth.protect, wAuth.authorize("worker"));
wRouter.get("/profile",           getWorkerProfile);
wRouter.put("/profile",           updateWorkerProfile);
wRouter.get("/jobs",              getWorkerJobs);
wRouter.put("/availability",      toggleAvailability);
module.exports = { workerRouter: wRouter };

// ════════════════════════════════════════════════════════════
// routes/userRoutes.js
// ════════════════════════════════════════════════════════════
const uRouter = require("express").Router();
const { getProfile, updateProfile, addAddress, deleteAddress, getLoyaltyPoints } = require("../controllers/combinedControllers");
const uAuth = require("../middleware/auth");

uRouter.use(uAuth.protect, uAuth.authorize("customer"));
uRouter.get("/profile",              getProfile);
uRouter.put("/profile",              updateProfile);
uRouter.post("/address",             addAddress);
uRouter.delete("/address/:addressId", deleteAddress);
uRouter.get("/loyalty",             getLoyaltyPoints);
module.exports = { userRouter: uRouter };

// ════════════════════════════════════════════════════════════
// routes/reviewRoutes.js
// ════════════════════════════════════════════════════════════
const rRouter = require("express").Router();
const { createReview, getWorkerReviews, getAllReviews } = require("../controllers/combinedControllers");
const rAuth = require("../middleware/auth");

rRouter.post("/",                       rAuth.protect, rAuth.authorize("customer"), createReview);
rRouter.get("/worker/:workerId",        getWorkerReviews);
rRouter.get("/",                        rAuth.protect, rAuth.authorize("admin"),    getAllReviews);
module.exports = { reviewRouter: rRouter };

// ════════════════════════════════════════════════════════════
// routes/adminRoutes.js
// ════════════════════════════════════════════════════════════
const aRouter = require("express").Router();
const {
  getDashboardStats, getRevenueChart, getBookingsByService,
  getTopWorkers, createWorker, toggleWorker, getAllUsers,
} = require("../controllers/adminController");
const aAuth = require("../middleware/auth");

aRouter.use(aAuth.protect, aAuth.authorize("admin"));
aRouter.get("/stats",             getDashboardStats);
aRouter.get("/revenue-chart",     getRevenueChart);
aRouter.get("/bookings-by-service", getBookingsByService);
aRouter.get("/top-workers",       getTopWorkers);
aRouter.post("/workers",          createWorker);
aRouter.put("/workers/:id/toggle", toggleWorker);
aRouter.get("/users",             getAllUsers);
module.exports = { adminRouter: aRouter };
