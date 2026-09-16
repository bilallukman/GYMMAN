const db = require("../config/database");

// ==========================================
// ADD WORKOUT
// ==========================================

async function addWorkout(req, res) {

    const {
        exercise,
        muscle,
        weight,
        sets,
        reps
    } = req.body;


    const weightValue = parseFloat(weight);
    const setsValue = parseInt(sets, 10);
    const repsValue = parseInt(reps, 10);


    // Validate
    if (
        !exercise ||
        !muscle ||
        isNaN(weightValue) ||
        isNaN(setsValue) ||
        isNaN(repsValue) ||
        weightValue < 0 ||
        setsValue <= 0 ||
        repsValue <= 0
    ) {

        return res.status(400).json({
            message: "All workout fields are required."
        });

    }


    try {

        // Add workout
        const [result] = await db.query(`
            INSERT INTO workouts
            (
                user_id,
                exercise,
                muscle,
                weight,
                sets,
                reps
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            req.user.id,
            exercise,
            muscle,
            weightValue,
            setsValue,
            repsValue
        ]);


        res.status(201).json({

            message: "Workout added successfully.",

            workoutId: result.insertId

        });


    } catch (error) {

        console.error(
            "Add workout error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


// ==========================================
// GET USER WORKOUTS
// ==========================================

async function getWorkouts(req, res) {

    try {
        const [workouts] = await db.query(`
            SELECT
                id,
                exercise,
                muscle,
                weight,
                sets,
                reps,
                created_at
            FROM workouts
            WHERE user_id = ?
            ORDER BY id DESC
        `, [req.user.id]);


        res.json({
            workouts
        });


    } catch (error) {

        console.error(
            "Get workouts error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


// ==========================================
// DELETE WORKOUT
// ==========================================

async function deleteWorkout(req, res) {

    const { id } = req.params;

    try {
        const [result] = await db.query(`
            DELETE FROM workouts
            WHERE id = ?
              AND user_id = ?
        `, [
            id,
            req.user.id
        ]);


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Workout not found."
            });

        }


        res.json({
            message: "Workout deleted successfully."
        });


    } catch (error) {

        console.error(
            "Delete workout error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


module.exports = {
    addWorkout,
    getWorkouts,
    deleteWorkout
};