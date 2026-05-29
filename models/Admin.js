// models/Admin.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = sequelize.define("Admin", {
    admin_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("super_admin", "depot_manager", "logistics_officer"),
        defaultValue: "logistics_officer"
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active"
    }
}, {
    tableName: "srmss_admin",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

// Verify password method
Admin.prototype.verifyPassword = async function(password) {
    if (!this.password) {
        throw new Error("Password not found in database");
    }
    return await bcrypt.compare(password, this.password);
};

// Generate Access Token
Admin.prototype.generateAccessToken = function() {
    return jwt.sign(
        {
            id: this.admin_id,
            username: this.username,
            role: this.role,
            type: "access"
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );
};

// Generate Refresh Token
Admin.prototype.generateRefreshToken = function() {
    return jwt.sign(
        {
            id: this.admin_id,
            username: this.username,
            type: "refresh"
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    );
};

// Hash password before create
Admin.beforeCreate(async (admin) => {
    if (admin.password) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(admin.password, salt);
    }
});

// Hash password before update
Admin.beforeUpdate(async (admin) => {
    if (admin.changed("password")) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(admin.password, salt);
    }
});

module.exports = Admin;