
// controllers/driver.controller.js
const DriverService = require("../services/driver.service");

/**
 * Get all drivers
 * @route GET /api/drivers
 */
const getAllDrivers = async (req, res, next) => {
    try {
        const result = await DriverService.getAllDrivers(req.query);

        res.json({
            success: true,
            data: result.drivers,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get driver by ID
 * @route GET /api/drivers/:id
 */
const getDriverById = async (req, res, next) => {
    try {
        const driver = await DriverService.getDriverById(req.params.id);

        res.json({
            success: true,
            data: driver
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new driver
 * @route POST /api/drivers
 */
const createDriver = async (req, res, next) => {
    try {
        // Debug: Log everything
        console.log("=== CONTROLLER DEBUG ===");
        console.log("Content-Type header:", req.headers["content-type"]);
        console.log("req.body:", req.body);
        console.log("req.body type:", typeof req.body);
        console.log("req.body keys:", req.body ? Object.keys(req.body) : "null/undefined");

        // Check if body is empty
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is empty. Please send JSON data with Content-Type: application/json"
            });
        }

        // Check if body has data
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Request body is empty. Please check your JSON format."
            });
        }

        const driverData = {
            ...req.body,
            created_by: req.admin.id
        };

        console.log("Driver data being saved:", driverData);

        const driver = await DriverService.createDriver(driverData);

        res.status(201).json({
            success: true,
            message: "Driver created successfully",
            data: driver
        });
    } catch (error) {
        console.error("Create driver error:", error);
        next(error);
    }
};
/**
 * Update driver
 * @route PUT /api/drivers/:id
 */
const updateDriver = async (req, res, next) => {
    try {
        const driver = await DriverService.updateDriver(req.params.id, req.body);

        res.json({
            success: true,
            message: "Driver updated successfully",
            data: driver
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete driver
 * @route DELETE /api/drivers/:id
 */
const deleteDriver = async (req, res, next) => {
    try {
        await DriverService.deleteDriver(req.params.id);

        res.json({
            success: true,
            message: "Driver deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get active drivers list (for dropdown)
 * @route GET /api/drivers/active/list
 */
const getActiveDriversList = async (req, res, next) => {
    try {
        const drivers = await DriverService.getActiveDriversList();

        res.json({
            success: true,
            data: drivers
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get drivers with expiring licenses
 * @route GET /api/drivers/expiring-licenses
 */
const getExpiringLicenses = async (req, res, next) => {
    try {
        const drivers = await DriverService.getExpiringLicenses();

        res.json({
            success: true,
            count: drivers.length,
            data: drivers
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get driver statistics
 * @route GET /api/drivers/statistics
 */
const getDriverStatistics = async (req, res, next) => {
    try {
        const stats = await DriverService.getDriverStatistics();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    deleteDriver,
    getActiveDriversList,
    getExpiringLicenses,
    getDriverStatistics
};