const db = require("../config/database");

async function initializeDatabase() {

    try {

        // ==========================================
        // USERS TABLE
        // ==========================================

        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,

                username VARCHAR(100) NOT NULL UNIQUE,

                email VARCHAR(255) NOT NULL UNIQUE,

                password VARCHAR(255) NOT NULL,

                email_verified TINYINT(1) NOT NULL DEFAULT 0,

                verification_token_hash TEXT,

                verification_expires_at DATETIME,

                reset_token_hash TEXT,

                reset_expires_at DATETIME,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);


        // ==========================================
        // WORKOUTS TABLE
        // ==========================================

        await db.query(`
            CREATE TABLE IF NOT EXISTS workouts (
                id INT AUTO_INCREMENT PRIMARY KEY,

                user_id INT NOT NULL,

                exercise VARCHAR(255) NOT NULL,

                muscle VARCHAR(100) NOT NULL,

                weight DECIMAL(10,2) NOT NULL DEFAULT 0,

                sets INT NOT NULL,

                reps INT NOT NULL,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        `);


        // ==========================================
        // BMI RECORDS TABLE
        // ==========================================

        await db.query(`
            CREATE TABLE IF NOT EXISTS bmi_records (
                id INT AUTO_INCREMENT PRIMARY KEY,

                user_id INT NOT NULL,

                bmi DECIMAL(5,2) NOT NULL,

                height DECIMAL(6,2) NOT NULL,

                weight DECIMAL(7,3) NOT NULL,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        `);


        // ==========================================
        // CALORIE RECORDS TABLE
        // ==========================================

        await db.query(`
            CREATE TABLE IF NOT EXISTS calorie_records (
                id INT AUTO_INCREMENT PRIMARY KEY,

                user_id INT NOT NULL,

                calories INT NOT NULL,

                activity VARCHAR(255) NOT NULL,

                duration INT NOT NULL,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        `);


        // ==========================================
        // DIET PLANS TABLE
        // ==========================================

        await db.query(`
            CREATE TABLE IF NOT EXISTS diet_plans (
                id INT AUTO_INCREMENT PRIMARY KEY,

                user_id INT NOT NULL,

                breakfast TEXT,

                lunch TEXT,

                dinner TEXT,

                water DECIMAL(6,2) DEFAULT 0,

                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        `);


        // ==========================================
        // FAVORITES TABLE
        // ==========================================

        await db.query(`
            CREATE TABLE IF NOT EXISTS favorites (
                id INT AUTO_INCREMENT PRIMARY KEY,

                user_id INT NOT NULL,

                exercise VARCHAR(255) NOT NULL,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                UNIQUE KEY unique_user_exercise
                    (user_id, exercise),

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        `);


        // ==========================================
        // CUSTOM PROGRAMS TABLE
        // ==========================================

        await db.query(`
            CREATE TABLE IF NOT EXISTS custom_programs (
                id INT AUTO_INCREMENT PRIMARY KEY,

                user_id INT NOT NULL,

                name VARCHAR(255) NOT NULL,

                program_data LONGTEXT NOT NULL,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        `);


        // ==========================================
        // AUTH SESSIONS TABLE
        // ==========================================
        // Stores only the HASH of the login token.
        // The actual token remains in the user's browser.

        await db.query(`
            CREATE TABLE IF NOT EXISTS auth_sessions (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,

                user_id INT NOT NULL,

                token_hash CHAR(64) NOT NULL UNIQUE,

                expires_at DATETIME NOT NULL,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                INDEX idx_auth_sessions_user_id
                    (user_id),

                INDEX idx_auth_sessions_expires_at
                    (expires_at)
            )
        `);


        // ==========================================
        // REMOVE EXPIRED SESSIONS
        // ==========================================

        await db.query(`
            DELETE FROM auth_sessions
            WHERE expires_at <= NOW()
        `);


        console.log("All MySQL database tables are ready.");

    } catch (error) {

        console.error(
            "Database initialization failed:",
            error.message
        );

        throw error;
    }
}


module.exports = initializeDatabase;