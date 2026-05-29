// routes/auth.routes.js
const express = require("express");
const {
    login,
    refreshToken,
    getMe,
    changePassword,
    logout
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.post("/change-password", protect, changePassword);

module.exports = router;