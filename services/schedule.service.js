// services/schedule.service.js
const {
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
} = require("../repositories/schedule.repository");
const moment = require("moment");

class ScheduleService {
    /**
     * Create new schedule with conflict detection
     * @param {Object} data - Schedule data
     * @returns {Promise<Object>}
     */
    static async createSchedule(data) {
        // Check for conflict
        const conflict = await findScheduleConflictRepo(
            data.route_id,
            data.trip_date,
            data.departure_time
        );

        if (conflict) {
            throw new Error("Schedule conflict: Another trip exists at this time for this route");
        }

        const schedule = await createScheduleRepo(data);
        return schedule;
    }

    /**
     * Get schedule by ID
     * @param {number} id - Schedule ID
     * @returns {Promise<Object>}
     */
    static async getScheduleById(id) {
        const schedule = await findScheduleByIdRepo(id);

        if (!schedule) {
            throw new Error("Schedule not found");
        }

        // Calculate delay minutes
        const scheduleData = schedule.toJSON();
        if (schedule.actual_departure_time && schedule.departure_time) {
            const actual = moment(schedule.actual_departure_time, "HH:mm:ss");
            const scheduled = moment(schedule.departure_time, "HH:mm:ss");
            scheduleData.delay_minutes = Math.max(0, actual.diff(scheduled, "minutes"));
        } else {
            scheduleData.delay_minutes = 0;
        }

        return scheduleData;
    }

    /**
     * Get all schedules with pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>}
     */
    static async getAllSchedules(options) {
        const { count, rows } = await findAllSchedulesRepo(options);

        return {
            schedules: rows,
            pagination: {
                total: count,
                page: parseInt(options.page) || 1,
                limit: parseInt(options.limit) || 10,
                totalPages: Math.ceil(count / (parseInt(options.limit) || 10))
            }
        };
    }

    /**
     * Update schedule
     * @param {number} id - Schedule ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>}
     */
    static async updateSchedule(id, updateData) {
        const schedule = await findScheduleByIdRepo(id);

        if (!schedule) {
            throw new Error("Schedule not found");
        }

        await updateScheduleRepo(id, updateData);

        return await findScheduleByIdRepo(id);
    }

    /**
     * Update trip status
     * @param {number} id - Schedule ID
     * @param {string} status - Trip status
     * @param {Object} additionalData - Additional data
     * @returns {Promise<Object>}
     */
    static async updateTripStatus(id, status, additionalData = {}) {
        const schedule = await findScheduleByIdRepo(id);

        if (!schedule) {
            throw new Error("Schedule not found");
        }

        await updateTripStatusRepo(id, status, additionalData);

        return await findScheduleByIdRepo(id);
    }

    /**
     * Delete schedule
     * @param {number} id - Schedule ID
     * @returns {Promise<boolean>}
     */
    static async deleteSchedule(id) {
        const schedule = await findScheduleByIdRepo(id);

        if (!schedule) {
            throw new Error("Schedule not found");
        }

        await deleteScheduleRepo(id);
        return true;
    }

    /**
     * Get today's schedule
     * @returns {Promise<Array>}
     */
    static async getTodaySchedule() {
        const today = moment().format("YYYY-MM-DD");
        const currentTime = moment().format("HH:mm:ss");

        const schedules = await findTodaySchedulesRepo(today);

        // Add status based on current time
        return schedules.map(schedule => {
            const scheduleData = schedule.toJSON();
            if (schedule.trip_status === "completed" || schedule.trip_status === "cancelled") {
                return scheduleData;
            }

            const departureTime = schedule.departure_time;
            if (departureTime < currentTime) {
                scheduleData.trip_status = "delayed";
            } else if (departureTime === currentTime) {
                scheduleData.trip_status = "on_time";
            }

            return scheduleData;
        });
    }

    /**
     * Get schedule statistics
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @returns {Promise<Object>}
     */
    static async getScheduleStatistics(startDate, endDate) {
        const stats = await getScheduleStatisticsRepo(startDate, endDate);
        const statusCounts = await countSchedulesByStatusRepo(startDate, endDate);

        return {
            ...stats,
            ...statusCounts,
            completion_rate: stats.total ? ((stats.completed / stats.total) * 100).toFixed(2) : 0,
            on_time_rate: stats.total ? ((statusCounts.on_time / stats.total) * 100).toFixed(2) : 0
        };
    }
}

module.exports = ScheduleService;