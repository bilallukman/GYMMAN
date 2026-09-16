const db = require("../config/database");

// ==========================================
// SAVE BMI
// ==========================================

async function saveBMI(req, res) {

    const {
        bmi,
        height,
        weight
    } = req.body;


    if (
        !bmi ||
        !height ||
        !weight
    ) {

        return res.status(400).json({
            message: "BMI details are required."
        });

    }


    try {

        // Save BMI record
        const [result] = await db.query(`
            INSERT INTO bmi_records
            (
                user_id,
                bmi,
                height,
                weight
            )
            VALUES (?, ?, ?, ?)
        `, [
            req.user.id,
            parseFloat(bmi),
            parseFloat(height),
            parseFloat(weight)
        ]);


        res.status(201).json({

            message: "BMI saved successfully.",

            bmiId: result.insertId

        });


    } catch (error) {

        console.error(
            "Save BMI error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


// ==========================================
// GET LATEST BMI
// ==========================================

async function getBMI(req, res) {

    try {

        const [rows] = await db.query(`
            SELECT
                bmi,
                height,
                weight,
                created_at
            FROM bmi_records
            WHERE user_id = ?
            ORDER BY created_at DESC, id DESC
            LIMIT 1
        `, [req.user.id]);


        if (rows.length === 0) {

            return res.json({
                bmi: null
            });

        }


        res.json({
            bmi: rows[0]
        });


    } catch (error) {

        console.error(
            "Get BMI error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


module.exports = {
    saveBMI,
    getBMI
};