// services/route.service.js
const {
    createRouteRepo,
    findRouteByIdRepo,
    findRouteByCodeRepo,
    findAllRoutesRepo,
    findActiveRoutesRepo,
    updateRouteRepo,
    deleteRouteRepo,
    countRoutesByStatusRepo
} = require("../repositories/route.repository");

class RouteService {
    /**
     * Create new route
     * @param {Object} data - Route data
     * @returns {Promise<Object>}
     */
    static async createRoute(data) {
        const existingRoute = await findRouteByCodeRepo(data.route_code);
        if (existingRoute) {
            throw new Error("Route code already exists");
        }

        const route = await createRouteRepo(data);
        return route;
    }

    /**
     * Get route by ID
     * @param {number} id - Route ID
     * @returns {Promise<Object>}
     */
    static async getRouteById(id) {
        const route = await findRouteByIdRepo(id);

        if (!route) {
            throw new Error("Route not found");
        }

        return route;
    }

    /**
     * Get all routes with pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>}
     */
    static async getAllRoutes(options) {
        const { count, rows } = await findAllRoutesRepo(options);

        return {
            routes: rows,
            pagination: {
                total: count,
                page: parseInt(options.page) || 1,
                limit: parseInt(options.limit) || 10,
                totalPages: Math.ceil(count / (parseInt(options.limit) || 10))
            }
        };
    }

    /**
     * Update route
     * @param {number} id - Route ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>}
     */
    static async updateRoute(id, updateData) {
        const route = await findRouteByIdRepo(id);

        if (!route) {
            throw new Error("Route not found");
        }

        if (updateData.route_code && updateData.route_code !== route.route_code) {
            const existingRoute = await findRouteByCodeRepo(updateData.route_code);
            if (existingRoute) {
                throw new Error("Route code already exists");
            }
        }

        await updateRouteRepo(id, updateData);

        return await findRouteByIdRepo(id);
    }

    /**
     * Delete route
     * @param {number} id - Route ID
     * @returns {Promise<boolean>}
     */
    static async deleteRoute(id) {
        const route = await findRouteByIdRepo(id);

        if (!route) {
            throw new Error("Route not found");
        }

        await deleteRouteRepo(id);
        return true;
    }

    /**
     * Get active routes list (for dropdown)
     * @returns {Promise<Array>}
     */
    static async getActiveRoutesList() {
        return await findActiveRoutesRepo();
    }

    /**
     * Get route statistics
     * @returns {Promise<Object>}
     */
    static async getRouteStatistics() {
        const statusCounts = await countRoutesByStatusRepo();
        const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

        return {
            total,
            ...statusCounts
        };
    }
}

module.exports = RouteService;