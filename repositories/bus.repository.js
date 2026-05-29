// repositories/bus.repository.js
const { Bus } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../models");

/**
 * Create new bus
 * @param {Object} data - Bus creation data
 * @returns {Promise<Bus>}
 */
const createBusRepo = async (data) => {
    return await Bus.create(data);
};

/**
 * Find bus by ID
 * @param {number} id - Bus ID
 * @returns {Promise<Bus|null>}
 */
const findBusByIdRepo = async (id) => {
    return await Bus.findByPk(id);
};

/**
 * Find bus by registration number
 * @param {string} regNumber - Registration number
 * @returns {Promise<Bus|null>}
 */
const findBusByRegistrationRepo = async (regNumber) => {
    return await Bus.findOne({ where: { registration_number: regNumber } });
};

/**
 * Get all buses with pagination
 * @param {Object} options - Pagination and filter options
 * @returns {Promise<{count: number, rows: Bus[]}>}
 */
const findAllBusesRepo = async (options = {}) => {
    const { page = 1, limit = 10, search = "", status = "" } = options;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
        where[Op.or] = [
            { registration_number: { [Op.like]: `%${search}%` } },
            { model: { [Op.like]: `%${search}%` } }
        ];
    }
    if (status) where.status = status;

    return await Bus.findAndCountAll({
        where,
        limit,
        offset,
        order: [["created_at", "DESC"]]
    });
};

/**
 * Get all available buses
 * @returns {Promise<Bus[]>}
 */
const findAvailableBusesRepo = async () => {
    return await Bus.findAll({
        where: { status: "available" },
        attributes: ["bus_id", "registration_number", "model", "seating_capacity"]
    });
};

/**
 * Get buses by status
 * @param {string} status - Bus status
 * @returns {Promise<Bus[]>}
 */
const findBusesByStatusRepo = async (status) => {
    return await Bus.findAll({ where: { status } });
};

/**
 * Update bus
 * @param {number} id - Bus ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<[number, Bus[]]>}
 */
const updateBusRepo = async (id, updateData) => {
    return await Bus.update(updateData, { where: { bus_id: id } });
};

/**
 * Update bus status
 * @param {number} id - Bus ID
 * @param {string} status - New status
 * @returns {Promise<[number, Bus[]]>}
 */
const updateBusStatusRepo = async (id, status) => {
    return await Bus.update({ status }, { where: { bus_id: id } });
};

/**
 * Delete bus
 * @param {number} id - Bus ID
 * @returns {Promise<number>}
 */
const deleteBusRepo = async (id) => {
    return await Bus.destroy({ where: { bus_id: id } });
};

/**
 * Get buses needing maintenance
 * @param {Date} dateThreshold - Date threshold for maintenance due
 * @returns {Promise<Bus[]>}
 */
const findBusesNeedingMaintenanceRepo = async (dateThreshold) => {
    return await Bus.findAll({
        where: {
            next_maintenance_due: { [Op.lte]: dateThreshold },
            status: { [Op.ne]: "maintenance" }
        }
    });
};

/**
 * Count buses by status
 * @returns {Promise<Object>}
 */
const countBusesByStatusRepo = async () => {
    const counts = await Bus.findAll({
        attributes: [
            "status",
            [sequelize.fn("COUNT", sequelize.col("status")), "count"]
        ],
        group: ["status"]
    });

    const result = { available: 0, on_route: 0, maintenance: 0, out_of_service: 0 };
    counts.forEach(item => {
        result[item.status] = parseInt(item.dataValues.count);
    });

    return result;
};

module.exports = {
    createBusRepo,
    findBusByIdRepo,
    findBusByRegistrationRepo,
    findAllBusesRepo,
    findAvailableBusesRepo,
    findBusesByStatusRepo,
    updateBusRepo,
    updateBusStatusRepo,
    deleteBusRepo,
    findBusesNeedingMaintenanceRepo,
    countBusesByStatusRepo
};