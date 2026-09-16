const express = require("express");

const {
    saveBMI,
    getBMI
} = require("../controllers/bmiController");

const {
    requireAuth
} = require("../middleware/auth");

const router = express.Router();


// SAVE BMI
router.post("/", requireAuth, saveBMI);


// GET LATEST BMI
router.get("/:username", requireAuth, getBMI);


module.exports = router;