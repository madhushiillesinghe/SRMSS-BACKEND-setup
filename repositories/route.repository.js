// repositories/route.repository.js
const { Route } = require("../models");
const { Op } = require("sequelize");

/**
 * Create new route
 * @param {Object} data - Route creation data
 * @returns {Promise<Route>}
 */
const createRouteRepo = async (data) => {
    return await Route.create(data);
};

/**
 * Find route by ID
 * @param {number} id - Route ID
 * @returns {Promise<Route|null>}
 */
const findRouteByIdRepo = async (id) => {
    return await Route.findByPk(id);
};

/**
 * Find route by code
 * @param {string} code - Route code
 * @returns {Promise<Route|null>}
 */
const findRouteByCodeRepo = async (code) => {
    return await Route.findOne({ where: { route_code: code } });
};

/**
 * Get all routes with pagination
 * @param {Object} options - Pagination and filter options
 * @returns {Promise<{count: number, rows: Route[]}>}
 */
const findAllRoutesRepo = async (options = {}) => {
    const { page = 1, limit = 10, search = "", status = "" } = options;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
        where[Op.or] = [
            { route_code: { [Op.like]: `%${search}%` } },
            { route_name: { [Op.like]: `%${search}%` } },
            { start_point: { [Op.like]: `%${search}%` } },
            { end_point: { [Op.like]: `%${search}%` } }
        ];
    }
    if (status) where.status = status;

    return await Route.findAndCountAll({
        where,
        limit,
        offset,
        order: [["created_at", "DESC"]]
    });
};

/**
 * Get all active routes
 * @returns {Promise<Route[]>}
 */
const findActiveRoutesRepo = async () => {
    return await Route.findAll({
        where: { status: "active" },
        attributes: ["route_id", "route_code", "route_name", "start_point", "end_point", "total_distance_km"]
    });
};

/**
 * Update route
 * @param {number} id - Route ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<[number, Route[]]>}
 */
const updateRouteRepo = async (id, updateData) => {
    return await Route.update(updateData, { where: { route_id: id } });
};

/**
 * Update route status
 * @param {number} id - Route ID
 * @param {string} status - New status
 * @returns {Promise<[number, Route[]]>}
 */
const updateRouteStatusRepo = async (id, status) => {
    return await Route.update({ status }, { where: { route_id: id } });
};

/**
 * Delete route
 * @param {number} id - Route ID
 * @returns {Promise<number>}
 */
const deleteRouteRepo = async (id) => {
    return await Route.destroy({ where: { route_id: id } });
};

/**
 * Count routes by status
 * @returns {Promise<Object>}
 */
const countRoutesByStatusRepo = async () => {
    const counts = await Route.findAll({
        attributes: [
            "status",
            [sequelize.fn("COUNT", sequelize.col("status")), "count"]
        ],
        group: ["status"]
    });

    const result = { active: 0, inactive: 0, under_review: 0 };
    counts.forEach(item => {
        result[item.status] = parseInt(item.dataValues.count);
    });

    return result;
};

module.exports = {
    createRouteRepo,
    findRouteByIdRepo,
    findRouteByCodeRepo,
    findAllRoutesRepo,
    findActiveRoutesRepo,
    updateRouteRepo,
    updateRouteStatusRepo,
    deleteRouteRepo,
    countRoutesByStatusRepo
};