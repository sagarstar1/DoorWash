// vehicleRoutes.js
const express = require("express");
const router  = express.Router();
const { addVehicle, getMyVehicles, updateVehicle, deleteVehicle } = require("../controllers/combinedControllers");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("customer"));
router.post("/",      addVehicle);
router.get("/",       getMyVehicles);
router.put("/:id",    updateVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;
