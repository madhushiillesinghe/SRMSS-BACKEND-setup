// services/driver.service.js
const {
    createDriverRepo,
    findDriverByIdRepo,
    findDriverByLicenseRepo,
    findAllDriversRepo,
    findActiveDriversRepo,
    updateDriverRepo,
    deleteDriverRepo,
    findDriversWithExpiringLicensesRepo,
    countDriversByStatusRepo
} = require("../repositories/driver.repository");

class DriverService {
    /**
     * Create new driver
     * @param {Object} data - Driver data
     * @returns {Promise<Object>}
     */
    static async createDriver(data) {
        // Check for duplicate license
        const existingDriver = await findDriverByLicenseRepo(data.license_number);
        if (existingDriver) {
            throw new Error("License number already exists");
        }

        const driver = await createDriverRepo(data);
        return driver;
    }

    /**
     * Get driver by ID
     * @param {number} id - Driver ID
     * @returns {Promise<Object>}
     */
    static async getDriverById(id) {
        const driver = await findDriverByIdRepo(id);

        if (!driver) {
            throw new Error("Driver not found");
        }

        // Add computed fields
        const driverData = driver.toJSON();
        driverData.full_name = driver.getFullName();
        driverData.is_license_valid = driver.isLicenseValid();
        driverData.license_days_left = Math.ceil(
            (new Date(driver.license_expiry) - new Date()) / (1000 * 60 * 60 * 24)
        );

        return driverData;
    }

    /**
     * Get all drivers with pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>}
     */
    static async getAllDrivers(options) {
        const { count, rows } = await findAllDriversRepo(options);

        return {
            drivers: rows,
            pagination: {
                total: count,
                page: parseInt(options.page) || 1,
                limit: parseInt(options.limit) || 10,
                totalPages: Math.ceil(count / (parseInt(options.limit) || 10))
            }
        };
    }

    /**
     * Update driver
     * @param {number} id - Driver ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>}
     */
    static async updateDriver(id, updateData) {
        const driver = await findDriverByIdRepo(id);

        if (!driver) {
            throw new Error("Driver not found");
        }

        // Check license uniqueness if being updated
        if (updateData.license_number && updateData.license_number !== driver.license_number) {
            const existingDriver = await findDriverByLicenseRepo(updateData.license_number);
            if (existingDriver) {
                throw new Error("License number already exists");
            }
        }

        await updateDriverRepo(id, updateData);

        return await findDriverByIdRepo(id);
    }

    /**
     * Delete driver
     * @param {number} id - Driver ID
     * @returns {Promise<boolean>}
     */
    static async deleteDriver(id) {
        const driver = await findDriverByIdRepo(id);

        if (!driver) {
            throw new Error("Driver not found");
        }

        await deleteDriverRepo(id);
        return true;
    }

    /**
     * Get active drivers list (for dropdown)
     * @returns {Promise<Array>}
     */
    static async getActiveDriversList() {
        const drivers = await findActiveDriversRepo();

        return drivers.map(driver => ({
            driver_id: driver.driver_id,
            name: `${driver.first_name} ${driver.last_name}`,
            license_number: driver.license_number,
            phone: driver.phone
        }));
    }

    /**
     * Get drivers with expiring licenses
     * @returns {Promise<Array>}
     */
// services/driver.service.js
    static async getExpiringLicenses() {
        // Get today's date at start of day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate 30 days from today
        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);
        thirtyDaysLater.setHours(23, 59, 59, 999);

        console.log("Today:", today);
        console.log("30 days later:", thirtyDaysLater);

        const drivers = await findDriversWithExpiringLicensesRepo(today, thirtyDaysLater);

        console.log("Found drivers:", drivers.length);

        return drivers.map(driver => ({
            ...driver.toJSON(),
            days_left: Math.ceil((new Date(driver.license_expiry) - today) / (1000 * 60 * 60 * 24)),
            full_name: `${driver.first_name} ${driver.last_name}`
        }));
    }
    /**
     * Get driver statistics
     * @returns {Promise<Object>}
     */
    static async getDriverStatistics() {
        const statusCounts = await countDriversByStatusRepo();
        const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

        return {
            total,
            ...statusCounts,
            expiring_licenses: (await this.getExpiringLicenses()).length
        };
    }
}

module.exports = DriverService;