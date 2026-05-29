// routes/schedule.routes.js
const express = require("express");
const {
    getAllSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    updateTripStatus,
    deleteSchedule,
    getTodaySchedule,
    getScheduleStatistics
} = require("../controllers/schedule.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/today", protect, getTodaySchedule);
router.get("/statistics", protect, getScheduleStatistics);
router.get("/", protect, getAllSchedules);
router.get("/:id", protect, getScheduleById);
router.post("/", protect, authorize("super_admin", "depot_manager"), createSchedule);
router.put("/:id", protect, authorize("super_admin", "depot_manager"), updateSchedule);
router.put("/:id/status", protect, updateTripStatus);
router.delete("/:id", protect, authorize("super_admin"), deleteSchedule);

module.exports = router;