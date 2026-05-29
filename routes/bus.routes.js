// routes/bus.routes.js
const express = require("express");
const {
    getAllBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus,
    getAvailableBusesList,
    getMaintenanceDueBuses,
    getBusStatistics
} = require("../controllers/bus.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/available/list", protect, getAvailableBusesList);
router.get("/maintenance-due", protect, getMaintenanceDueBuses);
router.get("/statistics", protect, getBusStatistics);
router.get("/", protect, getAllBuses);
router.get("/:id", protect, getBusById);
router.post("/", protect, authorize("super_admin", "depot_manager"), createBus);
router.put("/:id", protect, authorize("super_admin", "depot_manager"), updateBus);
router.delete("/:id", protect, authorize("super_admin"), deleteBus);

module.exports = router;