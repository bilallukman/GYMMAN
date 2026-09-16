const db = require("../config/database");

// ==========================================
// GET USER FAVORITES
// ==========================================

async function getFavorites(req, res) {

    try {
        const [favorites] = await db.query(`
            SELECT
                id,
                exercise,
                created_at
            FROM favorites
            WHERE user_id = ?
            ORDER BY created_at DESC, id DESC
        `, [req.user.id]);


        res.json({
            favorites
        });


    } catch (error) {

        console.error(
            "Get favorites error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


// ==========================================
// ADD FAVORITE
// ==========================================

async function addFavorite(req, res) {

    const {
        exercise
    } = req.body;


    if (
        !exercise ||
        !String(exercise).trim()
    ) {

        return res.status(400).json({
            message: "Username and exercise are required."
        });

    }


    try {

        const cleanExercise =
            String(exercise).trim();


        await db.query(`
            INSERT IGNORE INTO favorites
            (
                user_id,
                exercise
            )
            VALUES (?, ?)
        `, [
            req.user.id,
            cleanExercise
        ]);


        res.status(201).json({
            message: "Favorite added successfully."
        });


    } catch (error) {

        console.error(
            "Add favorite error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


// ==========================================
// DELETE FAVORITE
// ==========================================

async function deleteFavorite(req, res) {

    const {
        exercise
    } = req.body;


    if (!exercise) {

        return res.status(400).json({
            message: "Username and exercise are required."
        });

    }


    try {

        const [result] = await db.query(`
            DELETE FROM favorites
            WHERE user_id = ?
              AND exercise = ?
        `, [
            req.user.id,
            String(exercise).trim()
        ]);


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Favorite not found."
            });

        }


        res.json({
            message: "Favorite removed successfully."
        });


    } catch (error) {

        console.error(
            "Delete favorite error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


// ==========================================
// GET CUSTOM PROGRAMS
// ==========================================

async function getPrograms(req, res) {

    try {
        const [programs] = await db.query(`
            SELECT
                id,
                name,
                program_data,
                created_at,
                updated_at
            FROM custom_programs
            WHERE user_id = ?
            ORDER BY updated_at DESC, id DESC
        `, [req.user.id]);


        const parsedPrograms =
            programs.map(program => {

                let data = {};

                try {

                    data =
                        JSON.parse(
                            program.program_data
                        );

                } catch {

                    data = {};

                }


                return {

                    id: program.id,

                    name: program.name,

                    ...data,

                    createdAt:
                        program.created_at,

                    updatedAt:
                        program.updated_at

                };

            });


        res.json({
            programs: parsedPrograms
        });


    } catch (error) {

        console.error(
            "Get programs error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


// ==========================================
// CREATE CUSTOM PROGRAM
// ==========================================

async function createProgram(req, res) {

    const {
        name,
        program
    } = req.body;


    if (
        !name ||
        !program
    ) {

        return res.status(400).json({
            message:
                "Username, program name and program data are required."
        });

    }


    try {

        const cleanName =
            String(name).trim();


        if (!cleanName) {

            return res.status(400).json({
                message: "Program name is required."
            });

        }


        const [result] = await db.query(`
            INSERT INTO custom_programs
            (
                user_id,
                name,
                program_data
            )
            VALUES (?, ?, ?)
        `, [
            req.user.id,
            cleanName,
            JSON.stringify(program)
        ]);


        res.status(201).json({

            message:
                "Program created successfully.",

            programId:
                result.insertId

        });


    } catch (error) {

        console.error(
            "Create program error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


// ==========================================
// DELETE CUSTOM PROGRAM
// ==========================================

async function deleteProgram(req, res) {

    const {
        id
    } = req.params;


    try {
        const [result] = await db.query(`
            DELETE FROM custom_programs
            WHERE id = ?
              AND user_id = ?
        `, [
            id,
            req.user.id
        ]);


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Program not found."
            });

        }


        res.json({
            message: "Program deleted successfully."
        });


    } catch (error) {

        console.error(
            "Delete program error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }

}


module.exports = {
    getFavorites,
    addFavorite,
    deleteFavorite,
    getPrograms,
    createProgram,
    deleteProgram
};