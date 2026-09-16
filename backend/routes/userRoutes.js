const express = require("express");

const {
    getUserDashboard,
    updateUserProfile
} = require("../controllers/userController");

const {
    requireAuth
} = require("../middleware/auth");

const router = express.Router();


// ==========================================
// GET USER DASHBOARD
// ==========================================

router.get("/:username", requireAuth, getUserDashboard);


// ==========================================
// UPDATE USER PROFILE
// ==========================================

router.put("/:username", requireAuth, updateUserProfile);


module.exports = router;