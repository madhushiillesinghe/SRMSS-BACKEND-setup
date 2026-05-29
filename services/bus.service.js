// services/bus.service.js
const {
    createBusRepo,
    findBusByIdRepo,
    findBusByRegistrationRepo,
    findAllBusesRepo,
    findAvailableBusesRepo,
    updateBusRepo,
    deleteBusRepo,
    findBusesNeedingMaintenanceRepo,
    countBusesByStatusRepo
} = require("../repositories/bus.repository");

class BusService {
    /**
     * Create new bus
     * @param {Object} data - Bus data
     * @returns {Promise<Object>}
     */
    static async createBus(data) {
        const existingBus = await findBusByRegistrationRepo(data.registration_number);
        if (existingBus) {
            throw new Error("Registration number already exists");
        }

        const bus = await createBusRepo(data);
        return bus;
    }

    /**
     * Get bus by ID
     * @param {number} id - Bus ID
     * @returns {Promise<Object>}
     */
    static async getBusById(id) {
        const bus = await findBusByIdRepo(id);

        if (!bus) {
            throw new Error("Bus not found");
        }

        const busData = bus.toJSON();
        busData.is_available = bus.isAvailable();

        return busData;
    }

    /**
     * Get all buses with pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>}
     */
    static async getAllBuses(options) {
        const { count, rows } = await findAllBusesRepo(options);

        return {
            buses: rows,
            pagination: {
                total: count,
                page: parseInt(options.page) || 1,
                limit: parseInt(options.limit) || 10,
                totalPages: Math.ceil(count / (parseInt(options.limit) || 10))
            }
        };
    }

    /**
     * Update bus
     * @param {number} id - Bus ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>}
     */
    static async updateBus(id, updateData) {
        const bus = await findBusByIdRepo(id);

        if (!bus) {
            throw new Error("Bus not found");
        }

        if (updateData.registration_number && updateData.registration_number !== bus.registration_number) {
            const existingBus = await findBusByRegistrationRepo(updateData.registration_number);
            if (existingBus) {
                throw new Error("Registration number already exists");
            }
        }

        await updateBusRepo(id, updateData);

        return await findBusByIdRepo(id);
    }

    /**
     * Delete bus
     * @param {number} id - Bus ID
     * @returns {Promise<boolean>}
     */
    static async deleteBus(id) {
        const bus = await findBusByIdRepo(id);

        if (!bus) {
            throw new Error("Bus not found");
        }

        await deleteBusRepo(id);
        return true;
    }

    /**
     * Get available buses list (for dropdown)
     * @returns {Promise<Array>}
     */
    static async getAvailableBusesList() {
        return await findAvailableBusesRepo();
    }

    /**
     * Get buses needing maintenance
     * @returns {Promise<Array>}
     */
    static async getMaintenanceDueBuses() {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() + 7);

        return await findBusesNeedingMaintenanceRepo(dateThreshold);
    }

    /**
     * Get bus statistics
     * @returns {Promise<Object>}
     */
    static async getBusStatistics() {
        const statusCounts = await countBusesByStatusRepo();
        const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
        const available = statusCounts.available;

        return {
            total,
            ...statusCounts,
            utilization_rate: total ? (((total - available) / total) * 100).toFixed(2) : 0,
            maintenance_due: (await this.getMaintenanceDueBuses()).length
        };
    }
}

module.exports = BusService;