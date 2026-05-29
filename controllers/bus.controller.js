// controllers/bus.controller.js
const BusService = require("../services/bus.service");

/**
 * Get all buses
 * @route GET /api/buses
 */
const getAllBuses = async (req, res, next) => {
    try {
        const result = await BusService.getAllBuses(req.query);

        res.json({
            success: true,
            data: result.buses,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get bus by ID
 * @route GET /api/buses/:id
 */
const getBusById = async (req, res, next) => {
    try {
        const bus = await BusService.getBusById(req.params.id);

        res.json({
            success: true,
            data: bus
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new bus
 * @route POST /api/buses
 */
const createBus = async (req, res, next) => {
    try {
        const busData = {
            ...req.body,
            created_by: req.admin.id
        };

        const bus = await BusService.createBus(busData);

        res.status(201).json({
            success: true,
            message: "Bus created successfully",
            data: bus
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update bus
 * @route PUT /api/buses/:id
 */
const updateBus = async (req, res, next) => {
    try {
        const bus = await BusService.updateBus(req.params.id, req.body);

        res.json({
            success: true,
            message: "Bus updated successfully",
            data: bus
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete bus
 * @route DELETE /api/buses/:id
 */
const deleteBus = async (req, res, next) => {
    try {
        await BusService.deleteBus(req.params.id);

        res.json({
            success: true,
            message: "Bus deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get available buses list (for dropdown)
 * @route GET /api/buses/available/list
 */
const getAvailableBusesList = async (req, res, next) => {
    try {
        const buses = await BusService.getAvailableBusesList();

        res.json({
            success: true,
            data: buses
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get buses needing maintenance
 * @route GET /api/buses/maintenance-due
 */
const getMaintenanceDueBuses = async (req, res, next) => {
    try {
        const buses = await BusService.getMaintenanceDueBuses();

        res.json({
            success: true,
            count: buses.length,
            data: buses
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get bus statistics
 * @route GET /api/buses/statistics
 */
const getBusStatistics = async (req, res, next) => {
    try {
        const stats = await BusService.getBusStatistics();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus,
    getAvailableBusesList,
    getMaintenanceDueBuses,
    getBusStatistics
};