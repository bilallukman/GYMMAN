const express = require("express");

const {
    saveCalories,
    getCalories
} = require("../controllers/caloriesController");

const {
    requireAuth
} = require("../middleware/auth");

const router = express.Router();


// SAVE CALORIES
router.post("/", requireAuth, saveCalories);


// GET TOTAL CALORIES
router.get("/:username", requireAuth, getCalories);


module.exports = router;