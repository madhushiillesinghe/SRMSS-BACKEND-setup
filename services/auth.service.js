// services/auth.service.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
    findAdminByUsername,
    updateAdminLastLogin,
    findAdminById,
    findAdminByIdWithPassword,
    updateAdminPassword
} = require("../repositories/admin.repository");

class AuthService {

    static async login(username, password) {
        try {
            const admin = await findAdminByUsername(username);

            if (!admin) {
                throw new Error("Invalid credentials");
            }

            if (admin.status !== "active") {
                throw new Error("Account is inactive. Please contact administrator.");
            }

            const isValidPassword = await admin.verifyPassword(password);

            if (!isValidPassword) {
                throw new Error("Invalid credentials");
            }

            // Update last login
            await updateAdminLastLogin(admin.admin_id, new Date());

            // Generate tokens
            const accessToken = this.generateAccessToken(admin);
            const refreshToken = this.generateRefreshToken(admin);

            return {
                admin: {
                    admin_id: admin.admin_id,
                    username: admin.username,
                    email: admin.email,
                    full_name: admin.full_name,
                    role: admin.role
                },
                accessToken,
                refreshToken
            };
        } catch (error) {
            console.error("Login service error:", error);
            throw error;
        }
    }

    // Generate Access Token
    static generateAccessToken(admin) {
        return jwt.sign(
            {
                id: admin.admin_id,
                username: admin.username,
                role: admin.role,
                type: "access"
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
        );
    }

    // Generate Refresh Token
    static generateRefreshToken(admin) {
        return jwt.sign(
            {
                id: admin.admin_id,
                username: admin.username,
                type: "refresh"
            },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
        );
    }

    // Verify Refresh Token
    static verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            if (decoded.type !== "refresh") {
                throw new Error("Invalid token type");
            }
            return decoded;
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new Error("Refresh token has expired");
            }
            throw new Error("Invalid refresh token");
        }
    }

    static async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new Error("Refresh token is required");
        }

        try {
            console.log("Verifying refresh token...");

            // Verify the refresh token
            const decoded = this.verifyRefreshToken(refreshToken);
            console.log("Token verified for admin ID:", decoded.id);

            // Find admin by ID (without password for profile)
            const admin = await findAdminById(decoded.id);

            if (!admin) {
                throw new Error("Admin not found");
            }

            if (admin.status !== "active") {
                throw new Error("Admin account is inactive");
            }

            // Get full admin with password methods
            const fullAdmin = await findAdminByIdWithPassword(decoded.id);

            // Generate new tokens
            const newAccessToken = this.generateAccessToken(fullAdmin);
            const newRefreshToken = this.generateRefreshToken(fullAdmin);

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            console.error("Refresh token error:", error.message);
            throw error;
        }
    }

    static async getProfile(adminId) {
        const admin = await findAdminById(adminId);
        if (!admin) {
            throw new Error("Admin not found");
        }
        return admin;
    }

    static async changePassword(adminId, currentPassword, newPassword) {
        // Get admin with password included
        const admin = await findAdminByIdWithPassword(adminId);

        if (!admin) {
            throw new Error("Admin not found");
        }

        console.log("Admin found, verifying password...");

        // Verify current password
        const isValid = await admin.verifyPassword(currentPassword);

        if (!isValid) {
            throw new Error("Current password is incorrect");
        }

        // Validate new password
        if (newPassword.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password using repository
        await updateAdminPassword(adminId, hashedPassword);

        return true;
    }
}

module.exports = AuthService;