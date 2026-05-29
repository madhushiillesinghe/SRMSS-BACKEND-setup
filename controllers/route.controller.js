// controllers/route.controller.js
const RouteService = require("../services/route.service");

const getAllRoutes = async (req, res, next) => {
    try {
        const result = await RouteService.getAllRoutes(req.query);

        res.json({
            success: true,
            data: result.routes,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

const getRouteById = async (req, res, next) => {
    try {
        const route = await RouteService.getRouteById(req.params.id);

        res.json({
            success: true,
            data: route
        });
    } catch (error) {
        next(error);
    }
};

const createRoute = async (req, res, next) => {
    try {
        const routeData = {
            ...req.body,
            created_by: req.admin.id
        };

        const route = await RouteService.createRoute(routeData);

        res.status(201).json({
            success: true,
            message: "Route created successfully",
            data: route
        });
    } catch (error) {
        next(error);
    }
};

const updateRoute = async (req, res, next) => {
    try {
        const route = await RouteService.updateRoute(req.params.id, req.body);

        res.json({
            success: true,
            message: "Route updated successfully",
            data: route
        });
    } catch (error) {
        next(error);
    }
};

const deleteRoute = async (req, res, next) => {
    try {
        await RouteService.deleteRoute(req.params.id);

        res.json({
            success: true,
            message: "Route deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

const getActiveRoutesList = async (req, res, next) => {
    try {
        const routes = await RouteService.getActiveRoutesList();

        res.json({
            success: true,
            data: routes
        });
    } catch (error) {
        next(error);
    }
};

const getRouteStatistics = async (req, res, next) => {
    try {
        const stats = await RouteService.getRouteStatistics();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllRoutes,
    getRouteById,
    createRoute,
    updateRoute,
    deleteRoute,
    getActiveRoutesList,
    getRouteStatistics
};