const db = require("../config/database");

const {
    hashPassword,
    verifyPassword,
    validatePassword,
    createToken,
    hashToken
} = require("../utils/password");

const {
    sendVerificationEmail
} = require("../utils/emailService");


// ==========================================
// HELPERS
// ==========================================

function normalizeUsername(value) {
    return String(value || "").trim();
}

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function validateUsername(username) {

    if (
        username.length < 3 ||
        username.length > 30
    ) {
        return "Username must be 3–30 characters.";
    }

    if (
        !/^[A-Za-z0-9_.]+$/.test(username)
    ) {
        return "Username can contain letters, numbers, underscores and dots only.";
    }

    return null;
}

function validateEmail(email) {

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return "Enter a valid email address.";
    }

    return null;
}


// ==========================================
// CALCULATE STREAK
// ==========================================

function calculateStreak(dates) {

    if (
        !dates ||
        dates.length === 0
    ) {
        return 0;
    }


    const unique = [
        ...new Set(
            dates.map(
                value =>
                    String(value).slice(0, 10)
            )
        )
    ]
        .sort()
        .reverse();


    if (
        unique.length === 0
    ) {
        return 0;
    }


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const toDate = value => {

        const parts =
            String(value)
                .slice(0, 10)
                .split("-")
                .map(Number);

        return new Date(
            parts[0],
            parts[1] - 1,
            parts[2]
        );

    };


    const latest =
        toDate(
            unique[0]
        );


    const diffFromToday =
        Math.round(
            (
                today -
                latest
            ) /
            86400000
        );


    if (
        diffFromToday > 1
    ) {
        return 0;
    }


    let streak = 1;

    let previous =
        latest;


    for (
        let i = 1;
        i < unique.length;
        i++
    ) {

        const current =
            toDate(
                unique[i]
            );


        const diff =
            Math.round(
                (
                    previous -
                    current
                ) /
                86400000
            );


        if (
            diff !== 1
        ) {
            break;
        }


        streak++;

        previous =
            current;

    }


    return streak;
}


// ==========================================
// BUILD WEEKLY ACTIVITY
// ==========================================

function buildWeeklyActivity(
    activityRows
) {

    const counts =
        new Map();


    for (
        const row of activityRows || []
    ) {

        const rawDay =
            row.day;


        let day;


        if (
            rawDay instanceof Date
        ) {

            day =
                rawDay
                    .toISOString()
                    .slice(0, 10);

        } else {

            day =
                String(
                    rawDay || ""
                )
                    .slice(0, 10);

        }


        if (day) {

            counts.set(
                day,
                Number(
                    row.workouts || 0
                )
            );

        }

    }


    /*
     * Keep the same 7-day structure
     * used by the existing dashboard:
     *
     * index 0 = 6 days ago
     * index 6 = today
     */

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const result = [];


    for (
        let offset = 6;
        offset >= 0;
        offset--
    ) {

        const date =
            new Date(
                today
            );


        date.setDate(
            today.getDate() -
            offset
        );


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        const key =
            `${year}-${month}-${day}`;


        result.push({

            dayOffset:
                -(6 - result.length),

            count:
                Number(
                    counts.get(key) || 0
                )

        });

    }


    return result;
}


// ==========================================
// USER DASHBOARD
// ==========================================

async function getUserDashboard(
    req,
    res
) {

    try {

        // ==========================================
        // AUTHENTICATED USER
        // ==========================================

        const [
            userRows
        ] = await db.query(`
            SELECT
                id,
                username,
                email,
                email_verified,
                created_at
            FROM users
            WHERE id = ?
            LIMIT 1
        `, [
            req.user.id
        ]);


        if (
            userRows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "User account not found."

            });

        }


        const user =
            userRows[0];


        // ==========================================
        // PARALLEL DASHBOARD QUERIES
        // ==========================================
        //
        // These queries do not depend on each other.
        // Running them together removes unnecessary
        // sequential database/network waiting.
        //
        // ==========================================

        const [

            workoutsResult,

            bmiResult,

            calorieResult,

            dietResult,

            weightHistoryResult,

            activityHistoryResult,

            personalRecordsResult

        ] = await Promise.all([

            // --------------------------------------
            // WORKOUTS
            // --------------------------------------

            db.query(`
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
                ORDER BY created_at DESC, id DESC
            `, [
                user.id
            ]),


            // --------------------------------------
            // LATEST BMI
            // --------------------------------------

            db.query(`
                SELECT
                    bmi,
                    height,
                    weight,
                    created_at
                FROM bmi_records
                WHERE user_id = ?
                ORDER BY created_at DESC, id DESC
                LIMIT 1
            `, [
                user.id
            ]),


            // --------------------------------------
            // CALORIES
            // --------------------------------------

            db.query(`
                SELECT
                    COALESCE(
                        SUM(calories),
                        0
                    ) AS total
                FROM calorie_records
                WHERE user_id = ?
            `, [
                user.id
            ]),


            // --------------------------------------
            // DIET
            // --------------------------------------

            db.query(`
                SELECT
                    id,
                    breakfast,
                    lunch,
                    dinner,
                    water,
                    updated_at
                FROM diet_plans
                WHERE user_id = ?
                LIMIT 1
            `, [
                user.id
            ]),


            // --------------------------------------
            // WEIGHT HISTORY
            // --------------------------------------

            db.query(`
                SELECT
                    weight,
                    height,
                    bmi,
                    created_at
                FROM bmi_records
                WHERE user_id = ?
                ORDER BY created_at ASC
            `, [
                user.id
            ]),


            // --------------------------------------
            // WORKOUT ACTIVITY HISTORY
            // --------------------------------------

            db.query(`
                SELECT
                    DATE(created_at) AS day,
                    COUNT(*) AS workouts
                FROM workouts
                WHERE user_id = ?
                GROUP BY DATE(created_at)
                ORDER BY day ASC
            `, [
                user.id
            ]),


            // --------------------------------------
            // PERSONAL RECORDS
            // --------------------------------------

            db.query(`
                SELECT
                    exercise,
                    muscle,
                    MAX(weight) AS weight
                FROM workouts
                WHERE user_id = ?
                  AND weight > 0
                GROUP BY exercise, muscle
                ORDER BY weight DESC
            `, [
                user.id
            ])

        ]);


        // ==========================================
        // EXTRACT QUERY RESULTS
        // ==========================================

        const workouts =
            workoutsResult[0];


        const bmiRows =
            bmiResult[0];


        const calorieRows =
            calorieResult[0];


        const dietRows =
            dietResult[0];


        const weightHistory =
            weightHistoryResult[0];


        const activityHistory =
            activityHistoryResult[0];


        const personalRecords =
            personalRecordsResult[0];


        // ==========================================
        // BASIC STATISTICS
        // ==========================================

        const workoutCount =
            workouts.length;


        const bmiRecord =
            bmiRows.length > 0
                ? bmiRows[0]
                : null;


        const calorieTotal =
            calorieRows[0]?.total || 0;


        const diet =
            dietRows.length > 0
                ? dietRows[0]
                : null;


        // ==========================================
        // MUSCLE SETS
        // ==========================================

        const progress = {

            chest: 0,
            back: 0,
            shoulders: 0,
            legs: 0,
            arms: 0,
            cardio: 0,
            core: 0

        };


        // ==========================================
        // TRAINING TOTALS
        // ==========================================

        let totalSets = 0;

        let totalReps = 0;

        let totalVolume = 0;


        // ==========================================
        // MUSCLE VOLUME
        // ==========================================

        const muscleVolume = {

            chest: 0,
            back: 0,
            shoulders: 0,
            legs: 0,
            arms: 0,
            cardio: 0,
            core: 0

        };


        // ==========================================
        // PROCESS WORKOUTS
        // ==========================================

        workouts.forEach(
            workout => {

                const muscle =
                    String(
                        workout.muscle || ""
                    )
                        .trim()
                        .toLowerCase();


                const sets =
                    parseInt(
                        workout.sets,
                        10
                    ) || 0;


                const reps =
                    parseInt(
                        workout.reps,
                        10
                    ) || 0;


                const weight =
                    parseFloat(
                        workout.weight
                    ) || 0;


                totalSets +=
                    sets;


                totalReps +=
                    sets *
                    reps;


                const volume =
                    weight *
                    sets *
                    reps;


                totalVolume +=
                    volume;


                if (
                    Object.prototype.hasOwnProperty.call(
                        progress,
                        muscle
                    )
                ) {

                    progress[muscle] +=
                        sets;


                    muscleVolume[muscle] +=
                        volume;

                }

            }
        );


        // ==========================================
        // RECENT WORKOUTS
        // ==========================================

        const recentWorkouts =
            workouts.slice(
                0,
                8
            );


        // ==========================================
        // WEEKLY ACTIVITY
        // ==========================================

        /*
         * Previously this required 7 separate
         * database queries.
         *
         * We already have activityHistory above,
         * so build the 7-day result from it.
         */

        const weeklyActivity =
            buildWeeklyActivity(
                activityHistory
            );


        // ==========================================
        // STREAK
        // ==========================================

        const streakDates =
            activityHistory.map(
                row => row.day
            );


        const streak =
            calculateStreak(
                streakDates
            );


        // ==========================================
        // BEST EXERCISE
        // ==========================================

        const bestExercise =
            personalRecords.length
                ? personalRecords[0]
                : null;


        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({

            user: {

                id:
                    user.id,


                username:
                    user.username,


                email:
                    user.email,


                emailVerified:
                    Number(
                        user.email_verified
                    ) === 1,


                createdAt:
                    user.created_at,


                // ----------------------------------
                // BASIC STATISTICS
                // ----------------------------------

                workoutCount,


                streak,


                calories:
                    calorieTotal,


                // ----------------------------------
                // HEALTH
                // ----------------------------------

                bmi:
                    bmiRecord
                        ? bmiRecord.bmi
                        : null,


                height:
                    bmiRecord
                        ? bmiRecord.height
                        : null,


                weight:
                    bmiRecord
                        ? bmiRecord.weight
                        : null,


                bmiUpdatedAt:
                    bmiRecord
                        ? bmiRecord.created_at
                        : null,


                // ----------------------------------
                // DIET
                // ----------------------------------

                hasDiet:
                    !!diet,


                diet:
                    diet || null,


                // ----------------------------------
                // TRAINING
                // ----------------------------------

                totalSets,


                totalReps,


                totalVolume,


                // ----------------------------------
                // MUSCLE DATA
                // ----------------------------------

                progress,


                muscleVolume,


                // ----------------------------------
                // WORKOUT RECORDS
                // ----------------------------------

                recentWorkouts,


                weeklyActivity,


                activityHistory,


                weightHistory,


                personalRecords,


                bestExercise

            }

        });


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        res.status(500).json({

            message:
                "Server error."

        });

    }

}


// ==========================================
// UPDATE PROFILE
// ==========================================

async function updateUserProfile(
    req,
    res
) {

    const username =
        normalizeUsername(
            req.body.username
        );


    const email =
        normalizeEmail(
            req.body.email
        );


    const currentPassword =
        String(
            req.body.currentPassword || ""
        );


    const newPassword =
        String(
            req.body.newPassword || ""
        );


    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (
        !username ||
        !email ||
        !currentPassword
    ) {

        return res.status(400).json({

            message:
                "Username, email and current password are required."

        });

    }


    const usernameError =
        validateUsername(
            username
        );


    if (usernameError) {

        return res.status(400).json({

            message:
                usernameError

        });

    }


    const emailError =
        validateEmail(
            email
        );


    if (emailError) {

        return res.status(400).json({

            message:
                emailError

        });

    }


    // ==========================================
    // NEW PASSWORD VALIDATION
    // ==========================================

    if (newPassword) {

        const passwordError =
            validatePassword(
                newPassword
            );


        if (passwordError) {

            return res.status(400).json({

                message:
                    passwordError

            });

        }

    }


    try {

        // ==========================================
        // FIND AUTHENTICATED USER
        // ==========================================

        const [
            userRows
        ] = await db.query(`
            SELECT
                id,
                username,
                email,
                password,
                email_verified
            FROM users
            WHERE id = ?
            LIMIT 1
        `, [
            req.user.id
        ]);


        if (
            userRows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "User account not found."

            });

        }


        const user =
            userRows[0];


        // ==========================================
        // CHECK CURRENT PASSWORD
        // ==========================================

        if (
            !verifyPassword(
                currentPassword,
                user.password
            )
        ) {

            return res.status(401).json({

                message:
                    "Current password is incorrect."

            });

        }


        // ==========================================
        // CHECK USERNAME DUPLICATE
        // ==========================================

        const [
            duplicateUsernameRows
        ] =
            await db.query(`
                SELECT id
                FROM users
                WHERE LOWER(username) = LOWER(?)
                  AND id != ?
                LIMIT 1
            `, [
                username,
                user.id
            ]);


        if (
            duplicateUsernameRows.length > 0
        ) {

            return res.status(409).json({

                message:
                    "That username is already taken."

            });

        }


        // ==========================================
        // CHECK EMAIL DUPLICATE
        // ==========================================

        const [
            duplicateEmailRows
        ] =
            await db.query(`
                SELECT id
                FROM users
                WHERE LOWER(email) = LOWER(?)
                  AND id != ?
                LIMIT 1
            `, [
                email,
                user.id
            ]);


        if (
            duplicateEmailRows.length > 0
        ) {

            return res.status(409).json({

                message:
                    "An account with that email already exists."

            });

        }


        // ==========================================
        // CHECK EMAIL CHANGE
        // ==========================================

        const emailChanged =
            email.toLowerCase() !==
            String(
                user.email
            ).toLowerCase();


        let verificationToken =
            null;


        let verificationTokenHash =
            null;


        let verificationExpires =
            null;


        if (emailChanged) {

            verificationToken =
                createToken();


            verificationTokenHash =
                hashToken(
                    verificationToken
                );


            verificationExpires =
                new Date(
                    Date.now() +
                    24 *
                    60 *
                    60 *
                    1000
                );

        }


        // ==========================================
        // PASSWORD
        // ==========================================

        const passwordHash =
            newPassword
                ? hashPassword(
                    newPassword
                )
                : user.password;


        // ==========================================
        // UPDATE DATABASE
        // ==========================================

        if (emailChanged) {

            await db.query(`
                UPDATE users
                SET
                    username = ?,
                    email = ?,
                    password = ?,
                    email_verified = 0,
                    verification_token_hash = ?,
                    verification_expires_at = ?
                WHERE id = ?
            `, [
                username,
                email,
                passwordHash,
                verificationTokenHash,
                verificationExpires,
                user.id
            ]);

        } else {

            await db.query(`
                UPDATE users
                SET
                    username = ?,
                    password = ?
                WHERE id = ?
            `, [
                username,
                passwordHash,
                user.id
            ]);

        }


        // ==========================================
        // SEND NEW EMAIL VERIFICATION
        // ==========================================

        if (emailChanged) {

            try {

                await sendVerificationEmail(
                    email,
                    username,
                    verificationToken
                );

            } catch (emailError) {

                console.error(
                    "Profile email update error:",
                    emailError
                );


                // Restore old information

                await db.query(`
                    UPDATE users
                    SET
                        username = ?,
                        email = ?,
                        password = ?,
                        email_verified = ?,
                        verification_token_hash = NULL,
                        verification_expires_at = NULL
                    WHERE id = ?
                `, [
                    user.username,
                    user.email,
                    passwordHash,
                    user.email_verified,
                    user.id
                ]);


                return res.status(502).json({

                    message:
                        "Your email could not be changed because the verification email could not be sent. Your existing email was kept."

                });

            }

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            message:
                emailChanged
                    ? "Profile updated. Please verify your new email address."
                    : "Profile updated successfully.",


            user: {

                username,


                email,


                emailVerified:
                    emailChanged
                        ? false
                        : Number(
                            user.email_verified
                        ) === 1

            }

        });


    } catch (error) {

        console.error(
            "Profile update error:",
            error
        );


        return res.status(500).json({

            message:
                "Server error."

        });

    }

}


// ==========================================
// EXPORTS
// ==========================================

module.exports = {

    getUserDashboard,

    updateUserProfile

};