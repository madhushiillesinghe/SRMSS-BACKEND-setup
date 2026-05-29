// models/Driver.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Driver = sequelize.define("Driver", {
    driver_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'first_name'
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'last_name'
    },
    license_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'license_number'
    },
    license_expiry: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'license_expiry'
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        validate: {
            isEmail: true
        }
    },
    address: {
        type: DataTypes.TEXT
    },
    hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'hire_date'
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        field: 'date_of_birth'
    },
    emergency_contact: {
        type: DataTypes.STRING(15),
        field: 'emergency_contact'
    },
    max_working_hours_per_day: {
        type: DataTypes.INTEGER,
        defaultValue: 8,
        field: 'max_working_hours_per_day'
    },
    status: {
        type: DataTypes.ENUM("active", "on_leave", "suspended", "terminated"),
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
    tableName: "srmss_driver",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

// Virtual field for full name
Driver.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
};

// Check if license is valid
Driver.prototype.isLicenseValid = function() {
    return new Date(this.license_expiry) > new Date();
};

module.exports = Driver;