// models/RouteStop.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RouteStop = sequelize.define("RouteStop", {
    stop_id: {
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
    stop_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'stop_order'
    },
    stop_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'stop_name'
    },
    distance_from_start: {
        type: DataTypes.DECIMAL(8, 2),
        field: 'distance_from_start'
    },
    estimated_arrival_minutes: {
        type: DataTypes.INTEGER,
        field: 'estimated_arrival_minutes'
    },
    is_major_stop: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_major_stop'
    }
}, {
    tableName: "srmss_route_stop",
    timestamps: false
});

module.exports = RouteStop;