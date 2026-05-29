// models/index.js
const sequelize = require("../config/db");

// Import all models
const Admin = require("./Admin");
const Driver = require("./Driver");
const Bus = require("./Bus");
const Route = require("./Route");
const Schedule = require("./Schedule");
const Assignment = require("./Assignment");
const FuelLog = require("./FuelLog");
const Maintenance = require("./Maintenance");
const Ticket = require("./Ticket");
const RouteStop = require("./RouteStop");

// Define Associations (Relationships)

// Admin has many...
Admin.hasMany(Driver, { foreignKey: "created_by", as: "created_drivers" });
Admin.hasMany(Bus, { foreignKey: "created_by", as: "created_buses" });
Admin.hasMany(Route, { foreignKey: "created_by", as: "created_routes" });
Admin.hasMany(Assignment, { foreignKey: "assigned_by", as: "assignments" });
Admin.hasMany(Schedule, { foreignKey: "created_by", as: "schedules" });
Admin.hasMany(FuelLog, { foreignKey: "recorded_by", as: "fuel_logs" });
Admin.hasMany(Maintenance, { foreignKey: "recorded_by", as: "maintenance_records" });

// Driver has many...
Driver.hasMany(Assignment, { foreignKey: "driver_id", as: "assignments" });
Driver.hasMany(Schedule, { foreignKey: "assigned_driver_id", as: "schedules" });
Driver.belongsTo(Admin, { foreignKey: "created_by", as: "creator" });

// Bus has many...
Bus.hasMany(Assignment, { foreignKey: "bus_id", as: "assignments" });
Bus.hasMany(Schedule, { foreignKey: "assigned_bus_id", as: "schedules" });
Bus.hasMany(FuelLog, { foreignKey: "bus_id", as: "fuel_logs" });
Bus.hasMany(Maintenance, { foreignKey: "bus_id", as: "maintenance_records" });
Bus.belongsTo(Admin, { foreignKey: "created_by", as: "creator" });

// Route has many...
Route.hasMany(Assignment, { foreignKey: "route_id", as: "assignments" });
Route.hasMany(Schedule, { foreignKey: "route_id", as: "schedules" });
Route.hasMany(RouteStop, { foreignKey: "route_id", as: "stops" });
Route.belongsTo(Admin, { foreignKey: "created_by", as: "creator" });

// Schedule belongs to...
Schedule.belongsTo(Route, { foreignKey: "route_id", as: "route" });
Schedule.belongsTo(Bus, { foreignKey: "assigned_bus_id", as: "bus" });
Schedule.belongsTo(Driver, { foreignKey: "assigned_driver_id", as: "driver" });
Schedule.hasMany(Ticket, { foreignKey: "schedule_id", as: "tickets" });
Schedule.belongsTo(Admin, { foreignKey: "created_by", as: "creator" });

// Assignment belongs to...
Assignment.belongsTo(Driver, { foreignKey: "driver_id", as: "driver" });
Assignment.belongsTo(Bus, { foreignKey: "bus_id", as: "bus" });
Assignment.belongsTo(Route, { foreignKey: "route_id", as: "route" });
Assignment.belongsTo(Admin, { foreignKey: "assigned_by", as: "assigner" });

// FuelLog belongs to...
FuelLog.belongsTo(Bus, { foreignKey: "bus_id", as: "bus" });
FuelLog.belongsTo(Admin, { foreignKey: "recorded_by", as: "recorder" });

// Maintenance belongs to...
Maintenance.belongsTo(Bus, { foreignKey: "bus_id", as: "bus" });
Maintenance.belongsTo(Admin, { foreignKey: "recorded_by", as: "recorder" });

// Ticket belongs to...
Ticket.belongsTo(Schedule, { foreignKey: "schedule_id", as: "schedule" });

// RouteStop belongs to...
RouteStop.belongsTo(Route, { foreignKey: "route_id", as: "route" });

module.exports = {
    sequelize,
    Admin,
    Driver,
    Bus,
    Route,
    Schedule,
    Assignment,
    FuelLog,
    Maintenance,
    Ticket,
    RouteStop
};