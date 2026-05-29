// repositories/schedule.repository.js
const { Schedule, Route, Bus, Driver } = require("../models");
const { Op } = require("sequelize");

/**
 * Create new schedule
 * @param {Object} data - Schedule creation data
 * @returns {Promise<Schedule>}
 */
const createScheduleRepo = async (data) => {
    return await Schedule.create(data);
};

/**
 * Find schedule by ID
 * @param {number} id - Schedule ID
 * @returns {Promise<Schedule|null>}
 */
const findScheduleByIdRepo = async (id) => {
    return await Schedule.findByPk(id, {
        include: [
            { model: Route, as: "route" },
            { model: Bus, as: "bus" },
            { model: Driver, as: "driver" }
        ]
    });
};

/**
 * Get all schedules with pagination
 * @param {Object} options - Pagination and filter options
 * @returns {Promise<{count: number, rows: Schedule[]}>}
 */
const findAllSchedulesRepo = async (options = {}) => {
    const { page = 1, limit = 10, startDate, endDate, status } = options;
    const offset = (page - 1) * limit;

    const where = {};
    if (startDate && endDate) {
        where.trip_date = { [Op.between]: [startDate, endDate] };
    }
    if (status) where.trip_status = status;

    return await Schedule.findAndCountAll({
        where,
        limit,
        offset,
        order: [["trip_date", "DESC"], ["departure_time", "ASC"]],
        include: [
            { model: Route, as: "route", attributes: ["route_code", "route_name"] },
            { model: Bus, as: "bus", attributes: ["registration_number", "model"] },
            { model: Driver, as: "driver", attributes: ["first_name", "last_name"] }
        ]
    });
};

/**
 * Get schedules by date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Schedule[]>}
 */
const findSchedulesByDateRangeRepo = async (startDate, endDate) => {
    return await Schedule.findAll({
        where: { trip_date: { [Op.between]: [startDate, endDate] } },
        order: [["trip_date", "ASC"], ["departure_time", "ASC"]],
        include: [
            { model: Route, as: "route" },
            { model: Bus, as: "bus" },
            { model: Driver, as: "driver" }
        ]
    });
};

/**
 * Get today's schedules
 * @param {Date} today - Today's date
 * @returns {Promise<Schedule[]>}
 */
const findTodaySchedulesRepo = async (today) => {
    return await Schedule.findAll({
        where: { trip_date: today },
        order: [["departure_time", "ASC"]],
        include: [
            { model: Route, as: "route" },
            { model: Bus, as: "bus" },
            { model: Driver, as: "driver" }
        ]
    });
};

/**
 * Check for schedule conflict
 * @param {number} routeId - Route ID
 * @param {Date} tripDate - Trip date
 * @param {string} departureTime - Departure time
 * @returns {Promise<Schedule|null>}
 */
const findScheduleConflictRepo = async (routeId, tripDate, departureTime) => {
    return await Schedule.findOne({
        where: {
            route_id: routeId,
            trip_date: tripDate,
            departure_time: departureTime
        }
    });
};

/**
 * Update schedule
 * @param {number} id - Schedule ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<[number, Schedule[]]>}
 */
const updateScheduleRepo = async (id, updateData) => {
    return await Schedule.update(updateData, { where: { schedule_id: id } });
};

/**
 * Update trip status
 * @param {number} id - Schedule ID
 * @param {string} status - Trip status
 * @param {Object} additionalData - Additional data (actual times, delay reason)
 * @returns {Promise<[number, Schedule[]]>}
 */
const updateTripStatusRepo = async (id, status, additionalData = {}) => {
    return await Schedule.update(
        { trip_status: status, ...additionalData },
        { where: { schedule_id: id } }
    );
};

/**
 * Delete schedule
 * @param {number} id - Schedule ID
 * @returns {Promise<number>}
 */
const deleteScheduleRepo = async (id) => {
    return await Schedule.destroy({ where: { schedule_id: id } });
};

/**
 * Count schedules by status for date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>}
 */
const countSchedulesByStatusRepo = async (startDate, endDate) => {
    const counts = await Schedule.findAll({
        where: { trip_date: { [Op.between]: [startDate, endDate] } },
        attributes: [
            "trip_status",
            [sequelize.fn("COUNT", sequelize.col("trip_status")), "count"]
        ],
        group: ["trip_status"]
    });

    const result = { scheduled: 0, on_time: 0, delayed: 0, completed: 0, cancelled: 0 };
    counts.forEach(item => {
        result[item.trip_status] = parseInt(item.dataValues.count);
    });

    return result;
};

/**
 * Get schedule statistics
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>}
 */
const getScheduleStatisticsRepo = async (startDate, endDate) => {
    const total = await Schedule.count({
        where: { trip_date: { [Op.between]: [startDate, endDate] } }
    });

    const completed = await Schedule.count({
        where: {
            trip_date: { [Op.between]: [startDate, endDate] },
            trip_status: "completed"
        }
    });

    const totalPassengers = await Schedule.sum("passenger_count", {
        where: { trip_date: { [Op.between]: [startDate, endDate] } }
    });

    return { total, completed, totalPassengers: totalPassengers || 0 };
};

module.exports = {
    createScheduleRepo,
    findScheduleByIdRepo,
    findAllSchedulesRepo,
    findSchedulesByDateRangeRepo,
    findTodaySchedulesRepo,
    findScheduleConflictRepo,
    updateScheduleRepo,
    updateTripStatusRepo,
    deleteScheduleRepo,
    countSchedulesByStatusRepo,
    getScheduleStatisticsRepo
};