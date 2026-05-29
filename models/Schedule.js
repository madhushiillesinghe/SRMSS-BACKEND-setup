// models/Schedule.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Schedule = sequelize.define("Schedule", {
    schedule_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    route_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'route_id',
        references: {
            model: 'srmss_route',
            key: 'route_id'
        }
    },
    trip_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'trip_date'
    },
    departure_time: {
        type: DataTypes.TIME,
        allowNull: false,
        field: 'departure_time'
    },
    arrival_time: {
        type: DataTypes.TIME,
        allowNull: false,
        field: 'arrival_time'
    },
    assigned_bus_id: {
        type: DataTypes.INTEGER,
        field: 'assigned_bus_id',
        references: {
            model: 'srmss_bus',
            key: 'bus_id'
        }
    },
    assigned_driver_id: {
        type: DataTypes.INTEGER,
        field: 'assigned_driver_id',
        references: {
            model: 'srmss_driver',
            key: 'driver_id'
        }
    },
    trip_status: {
        type: DataTypes.ENUM("scheduled", "on_time", "delayed", "completed", "cancelled"),
        defaultValue: "scheduled",
        field: 'trip_status'
    },
    actual_departure_time: {
        type: DataTypes.TIME,
        field: 'actual_departure_time'
    },
    actual_arrival_time: {
        type: DataTypes.TIME,
        field: 'actual_arrival_time'
    },
    delay_reason: {
        type: DataTypes.TEXT,
        field: 'delay_reason'
    },
    passenger_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'passenger_count'
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
    tableName: "srmss_schedule",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

// Calculate delay in minutes
Schedule.prototype.getDelayMinutes = function() {
    if (!this.actual_departure_time || !this.departure_time) return 0;

    const actual = new Date(`1970-01-01T${this.actual_departure_time}`);
    const scheduled = new Date(`1970-01-01T${this.departure_time}`);
    return Math.max(0, (actual - scheduled) / 60000);
};

module.exports = Schedule;