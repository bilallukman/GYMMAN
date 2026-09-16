const rateLimit = require("express-rate-limit");
const db = require("../config/database");

const {
    hashPassword,
    verifyPassword,
    validatePassword,
    createToken,
    hashToken
} = require("../utils/password");

const {
    sendVerificationEmail,
    sendPasswordResetEmail,
    getAppUrl
} = require("../utils/emailService");

const VERIFY_HOURS = 24;
const RESET_MINUTES = 30;
const SESSION_DAYS = 7;


// ==========================================
// LOGIN RATE LIMITER
// ==========================================

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        message: "Too many login attempts. Please try again later."
    }
});

// ==========================================
// REGISTER RATE LIMITER
// ==========================================

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many registration attempts. Please try again later."
    }
});


// ==========================================
// RESEND VERIFICATION RATE LIMITER
// ==========================================

const resendVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many verification email requests. Please try again later."
    }
});


// ==========================================
// FORGOT PASSWORD RATE LIMITER
// ==========================================

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many password reset requests. Please try again later."
    }
});


// ==========================================
// NORMALIZATION
// ==========================================

function normalizeUsername(value) {
    return String(value || "").trim();
}

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}


// ==========================================
// VALIDATION
// ==========================================

function validateUsername(username) {

    if (username.length < 3 || username.length > 30) {
        return "Username must be 3–30 characters.";
    }

    if (!/^[A-Za-z0-9_.]+$/.test(username)) {
        return "Username can contain letters, numbers, underscores and dots only.";
    }

    return null;
}


function validateEmail(email) {

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "Enter a valid email address.";
    }

    return null;
}


// ==========================================
// REGISTER
// ==========================================

async function registerUser(req, res) {

    const username =
        normalizeUsername(req.body.username);

    const email =
        normalizeEmail(req.body.email);

    const password =
        req.body.password;


    if (!username || !email || !password) {

        return res.status(400).json({
            message: "All fields are required."
        });

    }


    const usernameError =
        validateUsername(username);

    if (usernameError) {

        return res.status(400).json({
            message: usernameError
        });

    }


    const emailError =
        validateEmail(email);

    if (emailError) {

        return res.status(400).json({
            message: emailError
        });

    }


    const passwordError =
        validatePassword(password);

    if (passwordError) {

        return res.status(400).json({
            message: passwordError
        });

    }


    try {

        // Check username
        const [usernameRows] = await db.query(`
            SELECT id
            FROM users
            WHERE LOWER(username) = LOWER(?)
            LIMIT 1
        `, [username]);


        if (usernameRows.length > 0) {

    return res.status(400).json({
        message:
            "Unable to create an account with the provided details."
    });

}


        // Check email
        const [emailRows] = await db.query(`
            SELECT id
            FROM users
            WHERE LOWER(email) = LOWER(?)
            LIMIT 1
        `, [email]);


        if (emailRows.length > 0) {

    return res.status(400).json({
        message:
            "Unable to create an account with the provided details."
    });

}


        // Create verification token
        const token =
            createToken();

        const tokenHash =
            hashToken(token);

        const expires =
            new Date(
                Date.now() +
                VERIFY_HOURS * 60 * 60 * 1000
            );


        // Create unverified account
        const [result] = await db.query(`
            INSERT INTO users
            (
                username,
                email,
                password,
                email_verified,
                verification_token_hash,
                verification_expires_at
            )
            VALUES (?, ?, ?, 0, ?, ?)
        `, [
            username,
            email,
            hashPassword(password),
            tokenHash,
            expires
        ]);


        // Send verification email
        try {

            await sendVerificationEmail(
                email,
                username,
                token
            );

        } catch (emailError) {

            console.error(
                "Verification email error:",
                emailError
            );


            // Remove account if email fails
            await db.query(`
                DELETE FROM users
                WHERE id = ?
            `, [result.insertId]);


            return res.status(503).json({
                message:
                    "We couldn't send the verification email. Please try again later."
            });

        }


        return res.status(201).json({

            message:
                "Registration successful. Check your email to verify your account.",

            userId:
                result.insertId,

            emailVerificationRequired:
                true

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        return res.status(500).json({
            message: "Server error."
        });

    }

}


// ==========================================
// LOGIN
// ==========================================

async function loginUser(req, res) {

    const identifier =
        normalizeUsername(
            req.body.username ||
            req.body.email
        );

    const password =
        req.body.password;


    if (!identifier || !password) {

        return res.status(400).json({

            message:
                "Username/email and password are required."

        });

    }


    try {

        const [users] = await db.query(`
            SELECT
                id,
                username,
                email,
                password,
                email_verified
            FROM users
            WHERE LOWER(username) = LOWER(?)
               OR LOWER(email) = LOWER(?)
            LIMIT 1
        `, [
            identifier,
            identifier
        ]);


        if (users.length === 0) {

            return res.status(401).json({

                message:
                    "Invalid username/email or password."

            });

        }


        const user =
            users[0];


        // Verify ONLY the secure password hash.
        // Plaintext legacy passwords are no longer accepted.
        const valid =
            verifyPassword(
                password,
                user.password
            );


        if (!valid) {

            return res.status(401).json({

                message:
                    "Invalid username/email or password."

            });

        }


        // Do not reveal whether an existing account is unverified.
// This prevents account enumeration.
if (!user.email_verified) {

    return res.status(401).json({

        message:
            "Invalid username/email or password."

    });

}

        // ==========================================
        // CREATE LOGIN SESSION
        // ==========================================

        const accessToken =
            createToken();

        const tokenHash =
            hashToken(accessToken);

        const expires =
            new Date(
                Date.now() +
                SESSION_DAYS * 24 * 60 * 60 * 1000
            );


        // Remove expired sessions for this user
        await db.query(`
            DELETE FROM auth_sessions
            WHERE user_id = ?
              AND expires_at <= NOW()
        `, [user.id]);


        // Create new authenticated session
        await db.query(`
            INSERT INTO auth_sessions
            (
                user_id,
                token_hash,
                expires_at
            )
            VALUES (?, ?, ?)
        `, [
            user.id,
            tokenHash,
            expires
        ]);


        return res.json({

            message:
                "Login successful.",

            accessToken,

            expiresAt:
                expires.toISOString(),

            user: {

                id:
                    user.id,

                username:
                    user.username,

                email:
                    user.email

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({
            message: "Server error."
        });

    }

}


// ==========================================
// CURRENT USER
// ==========================================

async function getCurrentUser(req, res) {

    return res.json({

        user: {

            id:
                req.user.id,

            username:
                req.user.username,

            email:
                req.user.email

        }

    });

}


// ==========================================
// LOGOUT
// ==========================================

async function logoutUser(req, res) {

    try {

        if (req.user?.tokenHash) {

            await db.query(`
                DELETE FROM auth_sessions
                WHERE token_hash = ?
            `, [
                req.user.tokenHash
            ]);

        }


        return res.json({

            message:
                "Logged out successfully."

        });


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        return res.status(500).json({

            message:
                "Unable to log out."

        });

    }

}


// ==========================================
// RESEND VERIFICATION
// ==========================================

async function resendVerification(req, res) {

    const email =
        normalizeEmail(req.body.email);


    const safeMessage =
        "If that account needs verification, a new verification email has been requested.";


    if (
        !email ||
        validateEmail(email)
    ) {

        return res.json({
            message: safeMessage
        });

    }


    try {

        const [users] = await db.query(`
            SELECT
                id,
                username,
                email,
                email_verified
            FROM users
            WHERE LOWER(email) = LOWER(?)
            LIMIT 1
        `, [email]);


        if (
            users.length === 0 ||
            users[0].email_verified
        ) {

            return res.json({
                message: safeMessage
            });

        }


        const user =
            users[0];


        // Create new token
        const token =
            createToken();

        const tokenHash =
            hashToken(token);

        const expires =
            new Date(
                Date.now() +
                VERIFY_HOURS * 60 * 60 * 1000
            );


        /*
            Send email FIRST.
            Only update database after success.
        */

        try {

            await sendVerificationEmail(
                user.email,
                user.username,
                token
            );

        } catch (emailError) {

            console.error(
                "Resend verification email error:",
                emailError
            );


            return res.status(503).json({

                message:
                    "We couldn't send the verification email. Please try again later."

            });

        }


        // Save new token
        await db.query(`
            UPDATE users
            SET
                verification_token_hash = ?,
                verification_expires_at = ?
            WHERE id = ?
        `, [
            tokenHash,
            expires,
            user.id
        ]);


        return res.json({

            message:
                "A new verification email has been sent."

        });


    } catch (error) {

        console.error(
            "Resend verification error:",
            error
        );


        return res.status(500).json({

            message:
                "Unable to resend verification email."

        });

    }

}


// ==========================================
// VERIFY EMAIL
// ==========================================

async function verifyEmail(req, res) {

    const token =
        String(
            req.body.token || ""
        ).trim();


    if (!token) {

        return res.status(400).json({

            message:
                "Verification token is required."

        });

    }


    try {

        const tokenHash =
            hashToken(token);


        const [users] = await db.query(`
            SELECT
                id,
                username,
                email,
                email_verified,
                verification_token_hash,
                verification_expires_at
            FROM users
            WHERE verification_token_hash = ?
            LIMIT 1
        `, [tokenHash]);


        if (users.length === 0) {

            return res.status(400).json({

                message:
                    "This verification link is invalid or expired."

            });

        }


        const user =
            users[0];


        if (
            !user.verification_expires_at ||
            new Date(user.verification_expires_at) <=
                new Date()
        ) {

            return res.status(400).json({

                message:
                    "This verification link is invalid or expired."

            });

        }


        await db.query(`
            UPDATE users
            SET
                email_verified = 1,
                verification_token_hash = NULL,
                verification_expires_at = NULL
            WHERE id = ?
        `, [user.id]);


        return res.status(200).json({

            message:
                "Email verified successfully. You can now log in."

        });


    } catch (error) {

        console.error(
            "Email verification error:",
            error
        );


        return res.status(500).json({
            message: "Server error."
        });

    }

}


// ==========================================
// FORGOT PASSWORD
// ==========================================

async function forgotPassword(req, res) {

    const email =
        normalizeEmail(req.body.email);


    const safeMessage =
        "If an account exists for that email, a password reset link has been sent.";


    if (
        !email ||
        validateEmail(email)
    ) {

        return res.json({
            message: safeMessage
        });

    }


    try {

        const [users] = await db.query(`
            SELECT
                id,
                username,
                email
            FROM users
            WHERE LOWER(email) = LOWER(?)
            LIMIT 1
        `, [email]);


        if (users.length === 0) {

            return res.json({
                message: safeMessage
            });

        }


        const user =
            users[0];


        const token =
            createToken();

        const tokenHash =
            hashToken(token);

        const expires =
            new Date(
                Date.now() +
                RESET_MINUTES * 60 * 1000
            );


        /*
            Send email first.
            Only store reset token after success.
        */

        try {

            await sendPasswordResetEmail(
                user.email,
                user.username,
                token
            );

        } catch (emailError) {

            console.error(
                "Password reset email error:",
                emailError
            );


            return res.json({
                message: safeMessage
            });

        }


        await db.query(`
            UPDATE users
            SET
                reset_token_hash = ?,
                reset_expires_at = ?
            WHERE id = ?
        `, [
            tokenHash,
            expires,
            user.id
        ]);


        return res.json({
            message: safeMessage
        });


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );


        return res.json({
            message: safeMessage
        });

    }

}


// ==========================================
// RESET PASSWORD
// ==========================================

async function resetPassword(req, res) {

    const token =
        String(
            req.body.token || ""
        ).trim();

    const password =
        req.body.password;

    const confirmPassword =
        req.body.confirmPassword;


    if (
        !token ||
        !password ||
        !confirmPassword
    ) {

        return res.status(400).json({

            message:
                "All fields are required."

        });

    }


    if (
        password !== confirmPassword
    ) {

        return res.status(400).json({

            message:
                "Passwords do not match."

        });

    }


    const passwordError =
        validatePassword(password);


    if (passwordError) {

        return res.status(400).json({

            message:
                passwordError

        });

    }


    try {

        const [users] = await db.query(`
            SELECT id
            FROM users
            WHERE reset_token_hash = ?
              AND reset_expires_at > NOW()
            LIMIT 1
        `, [
            hashToken(token)
        ]);


        if (users.length === 0) {

            return res.status(400).json({

                message:
                    "This reset link is invalid or expired."

            });

        }


        const user =
            users[0];


        await db.query(`
            UPDATE users
            SET
                password = ?,
                reset_token_hash = NULL,
                reset_expires_at = NULL,
                email_verified = 1
            WHERE id = ?
        `, [
            hashPassword(password),
            user.id
        ]);


        // ==========================================
        // SECURITY:
        // INVALIDATE ALL EXISTING LOGIN SESSIONS
        // ==========================================

        await db.query(`
            DELETE FROM auth_sessions
            WHERE user_id = ?
        `, [user.id]);


        return res.json({

            message:
                "Password reset successfully. You can now log in."

        });


    } catch (error) {

        console.error(
            "Reset password error:",
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
    registerUser,
    loginUser,
    loginLimiter,
    registerLimiter,
    resendVerificationLimiter,
    forgotPasswordLimiter,
    getCurrentUser,
    logoutUser,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword
};