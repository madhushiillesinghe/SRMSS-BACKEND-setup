// middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const { findAdminById } = require("../repositories/admin.repository");

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // Verify access token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "srmss_secret_key");

            if (decoded.type !== "access") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token type"
                });
            }

            const admin = await findAdminById(decoded.id);

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: "Admin not found"
                });
            }

            if (admin.status !== "active") {
                return res.status(401).json({
                    success: false,
                    message: "Account is inactive"
                });
            }

            req.admin = {
                id: admin.admin_id,
                username: admin.username,
                email: admin.email,
                full_name: admin.full_name,
                role: admin.role
            };

            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Token has expired",
                    code: "TOKEN_EXPIRED"
                });
            }

            if (error.name === "JsonWebTokenError") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token",
                    code: "INVALID_TOKEN"
                });
            }

            return res.status(401).json({
                success: false,
                message: "Not authorized"
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: `Role ${req.admin.role} is not authorized to access this resource`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };