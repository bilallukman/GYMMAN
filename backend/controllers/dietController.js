const db = require("../config/database");

// ==========================================
// SAVE / UPDATE DIET
// ==========================================

async function saveDiet(req, res) {

    const {
        breakfast,
        lunch,
        dinner,
        water
    } = req.body;


    try {
        // Check if diet already exists
        const [existingRows] = await db.query(`
            SELECT id
            FROM diet_plans
            WHERE user_id = ?
            LIMIT 1
        `, [req.user.id]);


        if (existingRows.length > 0) {

            // Update existing diet
            await db.query(`
                UPDATE diet_plans
                SET
                    breakfast = ?,
                    lunch = ?,
                    dinner = ?,
                    water = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                breakfast || "",
                lunch || "",
                dinner || "",
                parseFloat(water) || 0,
                existingRows[0].id
            ]);


        } else {

            // Create new diet
            await db.query(`
                INSERT INTO diet_plans
                (
                    user_id,
                    breakfast,
                    lunch,
                    dinner,
                    water
                )
                VALUES (?, ?, ?, ?, ?)
            `, [
                req.user.id,
                breakfast || "",
                lunch || "",
                dinner || "",
                parseFloat(water) || 0
            ]);

        }


        res.json({
            message: "Diet plan saved successfully."
        });


    } catch (error) {

        console.error(
            "Save diet error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


// ==========================================
// GET DIET
// ==========================================

async function getDiet(req, res) {

    try {

        const [rows] = await db.query(`
            SELECT
                breakfast,
                lunch,
                dinner,
                water,
                updated_at
            FROM diet_plans
            WHERE user_id = ?
            LIMIT 1
        `, [req.user.id]);


        if (rows.length === 0) {

            return res.json({
                diet: null
            });

        }


        res.json({
            diet: rows[0]
        });


    } catch (error) {

        console.error(
            "Get diet error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


module.exports = {
    saveDiet,
    getDiet
};