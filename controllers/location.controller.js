// controllers/location.controller.js
const LocationService = require("../services/location.service");

/**
 * @desc    Geocode address to coordinates
 * @route   GET /api/location/geocode
 * @access  Private
 */
const geocode = async (req, res, next) => {
    try {
        const { address } = req.query;

        if (!address) {
            return res.status(400).json({
                success: false,
                message: "Address is required"
            });
        }

        const result = await LocationService.geocode(address);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reverse geocode coordinates to address
 * @route   GET /api/location/reverse-geocode
 * @access  Private
 */
const reverseGeocode = async (req, res, next) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required"
            });
        }

        const result = await LocationService.reverseGeocode(parseFloat(lat), parseFloat(lng));

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get route between two points
 * @route   GET /api/location/route
 * @access  Private
 */
const getRoute = async (req, res, next) => {
    try {
        const { origin, destination } = req.query;

        if (!origin || !destination) {
            return res.status(400).json({
                success: false,
                message: "Origin and destination are required"
            });
        }

        const result = await LocationService.getRoute(origin, destination);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get route with multiple waypoints
 * @route   POST /api/location/route-with-waypoints
 * @access  Private
 */
const getRouteWithWaypoints = async (req, res, next) => {
    try {
        const { waypoints } = req.body;

        if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
            return res.status(400).json({
                success: false,
                message: "At least 2 waypoints are required"
            });
        }

        const result = await LocationService.getRouteWithWaypoints(waypoints);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Search for places
 * @route   GET /api/location/search
 * @access  Private
 */
const searchPlaces = async (req, res, next) => {
    try {
        const { query, limit = 10, type } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const result = await LocationService.searchPlaces(query, parseInt(limit), type);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get nearby bus stops
 * @route   GET /api/location/nearby-stops
 * @access  Private
 */
const getNearbyBusStops = async (req, res, next) => {
    try {
        const { lat, lng, radius = 1000 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required"
            });
        }

        const result = await LocationService.getNearbyBusStops(
            parseFloat(lat),
            parseFloat(lng),
            parseInt(radius)
        );

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Validate and optimize route for route planning module
 * @route   POST /api/location/validate-route
 * @access  Private
 */
const validateRoute = async (req, res, next) => {
    try {
        const { start_point, end_point, intermediate_stops } = req.body;

        if (!start_point || !end_point) {
            return res.status(400).json({
                success: false,
                message: "Start point and end point are required"
            });
        }

        const result = await LocationService.validateAndOptimizeRoute({
            start_point,
            end_point,
            intermediate_stops: intermediate_stops || []
        });

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Calculate straight-line distance between two points
 * @route   GET /api/location/distance
 * @access  Private
 */
const calculateDistance = async (req, res, next) => {
    try {
        const { lat1, lng1, lat2, lng2 } = req.query;

        if (!lat1 || !lng1 || !lat2 || !lng2) {
            return res.status(400).json({
                success: false,
                message: "Both points coordinates are required"
            });
        }

        const distance = LocationService.calculateDistance(
            parseFloat(lat1), parseFloat(lng1),
            parseFloat(lat2), parseFloat(lng2)
        );

        res.json({
            success: true,
            data: {
                distance_km: distance,
                distance_m: distance * 1000,
                distance_miles: distance * 0.621371
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get distance matrix for multiple points
 * @route   POST /api/location/distance-matrix
 * @access  Private
 */
const getDistanceMatrix = async (req, res, next) => {
    try {
        const { origins, destinations } = req.body;

        if (!origins || !destinations) {
            return res.status(400).json({
                success: false,
                message: "Origins and destinations are required"
            });
        }

        const result = await LocationService.getDistanceMatrix(origins, destinations);

        res.json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    geocode,
    reverseGeocode,
    getRoute,
    getRouteWithWaypoints,
    searchPlaces,
    getNearbyBusStops,
    validateRoute,
    calculateDistance,
    getDistanceMatrix
};