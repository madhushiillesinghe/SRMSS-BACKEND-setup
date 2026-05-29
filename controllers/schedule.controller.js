// controllers/schedule.controller.js
const ScheduleService = require("../services/schedule.service");

const getAllSchedules = async (req, res, next) => {
    try {
        const result = await ScheduleService.getAllSchedules(req.query);

        res.json({
            success: true,
            data: result.schedules,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

const getScheduleById = async (req, res, next) => {
    try {
        const schedule = await ScheduleService.getScheduleById(req.params.id);

        res.json({
            success: true,
            data: schedule
        });
    } catch (error) {
        next(error);
    }
};

const createSchedule = async (req, res, next) => {
    try {
        const scheduleData = {
            ...req.body,
            created_by: req.admin.id
        };

        const schedule = await ScheduleService.createSchedule(scheduleData);

        res.status(201).json({
            success: true,
            message: "Schedule created successfully",
            data: schedule
        });
    } catch (error) {
        next(error);
    }
};

const updateSchedule = async (req, res, next) => {
    try {
        const schedule = await ScheduleService.updateSchedule(req.params.id, req.body);

        res.json({
            success: true,
            message: "Schedule updated successfully",
            data: schedule
        });
    } catch (error) {
        next(error);
    }
};

const updateTripStatus = async (req, res, next) => {
    try {
        const { trip_status, actual_departure_time, actual_arrival_time, delay_reason } = req.body;

        const schedule = await ScheduleService.updateTripStatus(
            req.params.id,
            trip_status,
            { actual_departure_time, actual_arrival_time, delay_reason }
        );

        res.json({
            success: true,
            message: "Trip status updated successfully",
            data: schedule
        });
    } catch (error) {
        next(error);
    }
};

const deleteSchedule = async (req, res, next) => {
    try {
        await ScheduleService.deleteSchedule(req.params.id);

        res.json({
            success: true,
            message: "Schedule deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

const getTodaySchedule = async (req, res, next) => {
    try {
        const schedules = await ScheduleService.getTodaySchedule();

        res.json({
            success: true,
            count: schedules.length,
            data: schedules
        });
    } catch (error) {
        next(error);
    }
};

const getScheduleStatistics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await ScheduleService.getScheduleStatistics(startDate, endDate);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    updateTripStatus,
    deleteSchedule,
    getTodaySchedule,
    getScheduleStatistics
};