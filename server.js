// server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const sequelize = require("./config/db");

const app = express();

// ✅ IMPORTANT: Body parser MUST come FIRST before routes
app.use(express.json());  // This parses JSON bodies
app.use(express.urlencoded({ extended: true }));  // This parses URL-encoded bodies

// Other middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Import models
const Admin = require("./models/Admin");

// Import routes
const authRoutes = require("./routes/auth.routes");
const driverRoutes = require("./routes/driver.routes");
const busRoutes = require("./routes/bus.routes");
const routeRoutes = require("./routes/route.routes");
const scheduleRoutes = require("./routes/schedule.routes");
const locationRoutes = require("./routes/location.routes");

// Health check
app.get("/", (req, res) => {
    res.json({
        name: "SRMSS Backend API",
        version: "1.0.0",
        status: "running"
    });
});

// API Routes - These come AFTER body parser
app.use("/api/auth", authRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/location", locationRoutes);

// Error handler (last)
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        success: false,
        message: err.message || "Server Error"
    });
});

// Start server
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected");

        await sequelize.sync({ alter: false });
        console.log("✅ Tables synced");

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`
            ═══════════════════════════════════════════
            🚀 SRMSS BACKEND SERVER RUNNING
            ═══════════════════════════════════════════
            📡 URL: http://localhost:${PORT}
            🔑 Admin: superadmin / Admin@123
            📊 Database: srmss_transport
            ═══════════════════════════════════════════
            `);
        });
    } catch (error) {
        console.error("❌ Server startup failed:", error);
        process.exit(1);
    }
};

startServer();