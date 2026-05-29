// routes/location.routes.js
const express = require("express");
const {
    geocode,
    reverseGeocode,
    getRoute,
    getRouteWithWaypoints,
    searchPlaces,
    getNearbyBusStops,
    validateRoute,
    calculateDistance,
    getDistanceMatrix
} = require("../controllers/location.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Geocoding endpoints (for route planning module)
router.get("/geocode", protect, geocode);
router.get("/reverse-geocode", protect, reverseGeocode);

// Routing endpoints (for route planning and scheduling)
router.get("/route", protect, getRoute);
router.post("/route-with-waypoints", protect, getRouteWithWaypoints);
router.post("/validate-route", protect, validateRoute);
router.post("/distance-matrix", protect, getDistanceMatrix);

// Search endpoints (for finding stops and locations)
router.get("/search", protect, searchPlaces);
router.get("/nearby-stops", protect, getNearbyBusStops);

// Utility endpoints
router.get("/distance", protect, calculateDistance);

module.exports = router;