const express = require("express");

const {
    registerUser,
    loginUser,
    loginLimiter,
    registerLimiter,
    resendVerificationLimiter,
    forgotPasswordLimiter,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    logoutUser
} = require("../controllers/authController");

const {
    requireAuth
} = require("../middleware/auth");

const router = express.Router();


// ==========================================
// PUBLIC AUTH ROUTES
// ==========================================

router.post("/register", registerLimiter, registerUser);

router.post("/login", loginLimiter, loginUser);

router.post("/verify-email", verifyEmail);

router.post(
    "/resend-verification",
    resendVerificationLimiter,
    resendVerification
);

router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    forgotPassword
);

router.post("/reset-password", resetPassword);


// ==========================================
// PROTECTED AUTH ROUTES
// ==========================================

// Return the currently authenticated user
router.get("/me", requireAuth, getCurrentUser);

// Invalidate the current login session
router.post("/logout", requireAuth, logoutUser);


module.exports = router;