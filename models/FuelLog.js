// models/FuelLog.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const FuelLog = sequelize.define("FuelLog", {
    fuel_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    bus_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'bus_id',
        references: {
            model: 'srmss_bus',
            key: 'bus_id'
        }
    },
    fuel_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'fuel_date'
    },
    fuel_liters: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'fuel_liters',
        validate: {
            min: 0
        }
    },
    fuel_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'fuel_cost',
        validate: {
            min: 0
        }
    },
    odometer_reading: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'odometer_reading',
        validate: {
            min: 0
        }
    },
    fuel_type: {
        type: DataTypes.ENUM("diesel", "petrol", "electric", "hybrid"),
        defaultValue: "diesel",
        field: 'fuel_type'
    },
    vendor_name: {
        type: DataTypes.STRING(100),
        field: 'vendor_name'
    },
    invoice_number: {
        type: DataTypes.STRING(50),
        field: 'invoice_number'
    },
    notes: {
        type: DataTypes.TEXT
    },
    recorded_by: {
        type: DataTypes.INTEGER,
        field: 'recorded_by',
        references: {
            model: 'srmss_admin',
            key: 'admin_id'
        }
    }
}, {
    tableName: "srmss_fuel_log",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

module.exports = FuelLog;