// repositories/driver.repository.js
const { Driver } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../models");
/**
 * Create new driver
 * @param {Object} data - Driver creation data
 * @returns {Promise<Driver>}
 */
const createDriverRepo = async (data) => {
    return await Driver.create(data);
};

/**
 * Find driver by ID
 * @param {number} id - Driver ID
 * @returns {Promise<Driver|null>}
 */
const findDriverByIdRepo = async (id) => {
    return await Driver.findByPk(id);
};

/**
 * Find driver by license number
 * @param {string} licenseNumber - License number
 * @returns {Promise<Driver|null>}
 */
const findDriverByLicenseRepo = async (licenseNumber) => {
    return await Driver.findOne({ where: { license_number: licenseNumber } });
};

/**
 * Find driver by email
 * @param {string} email - Driver email
 * @returns {Promise<Driver|null>}
 */
const findDriverByEmailRepo = async (email) => {
    return await Driver.findOne({ where: { email } });
};

/**
 * Get all drivers with pagination
 * @param {Object} options - Pagination and filter options
 * @returns {Promise<{count: number, rows: Driver[]}>}
 */
const findAllDriversRepo = async (options = {}) => {
    const { page = 1, limit = 10, search = "", status = "" } = options;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
        where[Op.or] = [
            { first_name: { [Op.like]: `%${search}%` } },
            { last_name: { [Op.like]: `%${search}%` } },
            { license_number: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } }
        ];
    }
    if (status) where.status = status;

    return await Driver.findAndCountAll({
        where,
        limit,
        offset,
        order: [["created_at", "DESC"]]
    });
};

/**
 * Get all active drivers
 * @returns {Promise<Driver[]>}
 */
const findActiveDriversRepo = async () => {
    return await Driver.findAll({
        where: { status: "active" },
        attributes: ["driver_id", "first_name", "last_name", "license_number", "phone"]
    });
};

/**
 * Update driver
 * @param {number} id - Driver ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<[number, Driver[]]>}
 */
const updateDriverRepo = async (id, updateData) => {
    return await Driver.update(updateData, { where: { driver_id: id } });
};

/**
 * Update driver status
 * @param {number} id - Driver ID
 * @param {string} status - New status
 * @returns {Promise<[number, Driver[]]>}
 */
const updateDriverStatusRepo = async (id, status) => {
    return await Driver.update({ status }, { where: { driver_id: id } });
};

/**
 * Delete driver
 * @param {number} id - Driver ID
 * @returns {Promise<number>}
 */
const deleteDriverRepo = async (id) => {
    return await Driver.destroy({ where: { driver_id: id } });
};

/**
 * Get drivers with expiring licenses
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Driver[]>}
 */
// repositories/driver.repository.js

const findDriversWithExpiringLicensesRepo = async (startDate, endDate) => {
    console.log("Repository - Start date:", startDate);
    console.log("Repository - End date:", endDate);

    // Alternative approach: Use DATE format
    const drivers = await Driver.findAll({
        where: {
            license_expiry: {
                [Op.gte]: startDate,
                [Op.lte]: endDate
            },
            status: "active"
        },
        order: [["license_expiry", "ASC"]]
    });

    console.log("Repository - Found:", drivers.length);
    return drivers;
};
/**
 * Count drivers by status
 * @returns {Promise<Object>}
 */
const countDriversByStatusRepo = async () => {
    const counts = await Driver.findAll({
        attributes: [
            "status",
            [sequelize.fn("COUNT", sequelize.col("status")), "count"]
        ],
        group: ["status"]
    });

    const result = { active: 0, on_leave: 0, suspended: 0, terminated: 0 };
    counts.forEach(item => {
        result[item.status] = parseInt(item.dataValues.count);
    });

    return result;
};

module.exports = {
    createDriverRepo,
    findDriverByIdRepo,
    findDriverByLicenseRepo,
    findDriverByEmailRepo,
    findAllDriversRepo,
    findActiveDriversRepo,
    updateDriverRepo,
    updateDriverStatusRepo,
    deleteDriverRepo,
    findDriversWithExpiringLicensesRepo,
    countDriversByStatusRepo
};