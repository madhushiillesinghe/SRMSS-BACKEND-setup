// models/Bus.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Bus = sequelize.define("Bus", {
    bus_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    registration_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'registration_number'
    },
    model: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    make_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'make_year',
        validate: {
            min: 1990,
            max: new Date().getFullYear() + 1
        }
    },
    seating_capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'seating_capacity',
        validate: {
            min: 10,
            max: 100
        }
    },
    fuel_type: {
        type: DataTypes.ENUM("diesel", "petrol", "electric", "hybrid"),
        defaultValue: "diesel",
        field: 'fuel_type'
    },
    mileage_per_liter: {
        type: DataTypes.DECIMAL(5, 2),
        field: 'mileage_per_liter'
    },
    current_odometer: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'current_odometer'
    },
    last_maintenance_date: {
        type: DataTypes.DATEONLY,
        field: 'last_maintenance_date'
    },
    next_maintenance_due: {
        type: DataTypes.DATEONLY,
        field: 'next_maintenance_due'
    },
    insurance_expiry: {
        type: DataTypes.DATEONLY,
        field: 'insurance_expiry'
    },
    status: {
        type: DataTypes.ENUM("available", "on_route", "maintenance", "out_of_service"),
        defaultValue: "available"
    },
    depot_location: {
        type: DataTypes.STRING(100),
        field: 'depot_location'
    },
    created_by: {
        type: DataTypes.INTEGER,
        field: 'created_by',
        references: {
            model: 'srmss_admin',
            key: 'admin_id'
        }
    }
}, {
    tableName: "srmss_bus",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

// Check if bus is available
Bus.prototype.isAvailable = function() {
    return this.status === "available";
};

// Check if maintenance is overdue
Bus.prototype.isMaintenanceOverdue = function() {
    if (!this.next_maintenance_due) return false;
    return new Date(this.next_maintenance_due) < new Date();
};

module.exports = Bus;