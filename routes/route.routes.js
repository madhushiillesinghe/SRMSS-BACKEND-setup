// routes/route.routes.js
const express = require("express");
const {
    getAllRoutes,
    getRouteById,
    createRoute,
    updateRoute,
    deleteRoute,
    getActiveRoutesList,
    getRouteStatistics
} = require("../controllers/route.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/active/list", protect, getActiveRoutesList);
router.get("/statistics", protect, getRouteStatistics);
router.get("/", protect, getAllRoutes);
router.get("/:id", protect, getRouteById);
router.post("/", protect, authorize("super_admin", "depot_manager"), createRoute);
router.put("/:id", protect, authorize("super_admin", "depot_manager"), updateRoute);
router.delete("/:id", protect, authorize("super_admin"), deleteRoute);

module.exports = router;