// models/Ticket.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const crypto = require("crypto");

const Ticket = sequelize.define("Ticket", {
    ticket_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'schedule_id',
        references: {
            model: 'srmss_schedule',
            key: 'schedule_id'
        }
    },
    passenger_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'passenger_name'
    },
    passenger_phone: {
        type: DataTypes.STRING(15),
        field: 'passenger_phone'
    },
    seat_number: {
        type: DataTypes.STRING(10),
        field: 'seat_number'
    },
    fare_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'fare_amount',
        validate: {
            min: 0
        }
    },
    payment_status: {
        type: DataTypes.ENUM("pending", "paid", "refunded"),
        defaultValue: "pending",
        field: 'payment_status'
    },
    booking_reference: {
        type: DataTypes.STRING(50),
        unique: true,
        field: 'booking_reference'
    }
}, {
    tableName: "srmss_ticket",
    timestamps: true,
    createdAt: "booking_date",
    updatedAt: false,
    hooks: {
        beforeCreate: (ticket) => {
            if (!ticket.booking_reference) {
                ticket.booking_reference = `SRMSS-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
            }
        }
    }
});

module.exports = Ticket;