const express = require("express");

const {
    saveDiet,
    getDiet
} = require("../controllers/dietController");

const {
    requireAuth
} = require("../middleware/auth");

const router = express.Router();


// SAVE / UPDATE DIET
router.post("/", requireAuth, saveDiet);


// GET USER DIET
router.get("/:username", requireAuth, getDiet);


module.exports = router;