// models/Route.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Route = sequelize.define("Route", {
    route_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    route_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'route_code'
    },
    route_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'route_name'
    },
    start_point: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'start_point'
    },
    end_point: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'end_point'
    },
    total_distance_km: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        field: 'total_distance_km',
        validate: {
            min: 0
        }
    },
    estimated_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'estimated_duration_minutes',
        validate: {
            min: 1
        }
    },
    intermediate_stops: {
        type: DataTypes.TEXT,
        field: 'intermediate_stops',
        get() {
            const rawValue = this.getDataValue('intermediate_stops');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('intermediate_stops', JSON.stringify(value));
        }
    },
    peak_frequency_minutes: {
        type: DataTypes.INTEGER,
        field: 'peak_frequency_minutes'
    },
    off_peak_frequency_minutes: {
        type: DataTypes.INTEGER,
        field: 'off_peak_frequency_minutes'
    },
    status: {
        type: DataTypes.ENUM("active", "inactive", "under_review"),
        defaultValue: "active"
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
    tableName: "srmss_route",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

module.exports = Route;