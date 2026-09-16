const express = require("express");

const {
    addWorkout,
    getWorkouts,
    deleteWorkout
} = require("../controllers/workoutController");

const {
    requireAuth
} = require("../middleware/auth");

const router = express.Router();


// ADD WORKOUT
router.post("/", requireAuth, addWorkout);


// GET USER WORKOUTS
router.get("/:username", requireAuth, getWorkouts);


// DELETE WORKOUT
router.delete("/:id", requireAuth, deleteWorkout);


module.exports = router;