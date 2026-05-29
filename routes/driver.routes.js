// routes/driver.routes.js
const express = require("express");
const {
    getAllDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    deleteDriver,
    getActiveDriversList,
    getExpiringLicenses,
    getDriverStatistics
} = require("../controllers/driver.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/active/list", protect, getActiveDriversList);
router.get("/expiring-licenses", protect, getExpiringLicenses);
router.get("/statistics", protect, getDriverStatistics);
router.get("/", protect, getAllDrivers);
router.get("/:id", protect, getDriverById);
router.post("/", protect, authorize("super_admin", "depot_manager"), createDriver);
router.put("/:id", protect, authorize("super_admin", "depot_manager"), updateDriver);
router.delete("/:id", protect, authorize("super_admin"), deleteDriver);

module.exports = router;