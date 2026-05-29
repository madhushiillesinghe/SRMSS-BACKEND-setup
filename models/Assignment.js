// models/Assignment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Assignment = sequelize.define("Assignment", {
    assignment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    driver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'srmss_driver',
            key: 'driver_id'
        }
    },
    bus_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'srmss_bus',
            key: 'bus_id'
        }
    },
    route_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'srmss_route',
            key: 'route_id'
        }
    },
    assign_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    shift_start: {
        type: DataTypes.TIME,
        allowNull: false
    },
    shift_end: {
        type: DataTypes.TIME,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("scheduled", "active", "completed", "cancelled"),
        defaultValue: "scheduled"
    },
    notes: {
        type: DataTypes.TEXT
    },
    assigned_by: {
        type: DataTypes.INTEGER,
        references: {
            model: 'srmss_admin',
            key: 'admin_id'
        }
    }
}, {
    tableName: "srmss_assignment",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

module.exports = Assignment;