const db = require("../config/database");

// ==========================================
// SAVE CALORIES
// ==========================================

async function saveCalories(req, res) {

    const {
        calories,
        activity,
        duration
    } = req.body;


    if (
        !calories ||
        !activity ||
        !duration
    ) {

        return res.status(400).json({
            message: "Calories details are required."
        });

    }


    try {

        // Save calorie record
        const [result] = await db.query(`
            INSERT INTO calorie_records
            (
                user_id,
                calories,
                activity,
                duration
            )
            VALUES (?, ?, ?, ?)
        `, [
            req.user.id,
            parseInt(calories, 10),
            activity,
            parseInt(duration, 10)
        ]);


        res.status(201).json({

            message: "Calories saved successfully.",

            calorieId: result.insertId

        });


    } catch (error) {

        console.error(
            "Save calories error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


// ==========================================
// GET TOTAL CALORIES
// ==========================================

async function getCalories(req, res) {

    try {

        const [rows] = await db.query(`
            SELECT
                COALESCE(SUM(calories), 0) AS total
            FROM calorie_records
            WHERE user_id = ?
        `, [req.user.id]);


        res.json({

            calories: rows[0]?.total || 0

        });


    } catch (error) {

        console.error(
            "Get calories error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


module.exports = {
    saveCalories,
    getCalories
};