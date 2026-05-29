// models/Maintenance.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Maintenance = sequelize.define("Maintenance", {
    maintenance_id: {
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
    maintenance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'maintenance_date'
    },
    maintenance_type: {
        type: DataTypes.ENUM("routine", "corrective", "emergency", "inspection"),
        allowNull: false,
        field: 'maintenance_type'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    cost_amount: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'cost_amount',
        validate: {
            min: 0
        }
    },
    odometer_at_service: {
        type: DataTypes.INTEGER,
        field: 'odometer_at_service'
    },
    next_due_date: {
        type: DataTypes.DATEONLY,
        field: 'next_due_date'
    },
    vendor_name: {
        type: DataTypes.STRING(100),
        field: 'vendor_name'
    },
    invoice_number: {
        type: DataTypes.STRING(50),
        field: 'invoice_number'
    },
    status: {
        type: DataTypes.ENUM("scheduled", "in_progress", "completed", "cancelled"),
        defaultValue: "scheduled"
    },
    performed_by: {
        type: DataTypes.STRING(100),
        field: 'performed_by'
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
    tableName: "srmss_maintenance",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

module.exports = Maintenance;