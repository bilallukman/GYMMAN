const db = require("../config/database");
const { hashToken } = require("../utils/password");

async function requireAuth(req, res, next) {
    try {
        const header = String(req.headers.authorization || "").trim();

        if (!header.toLowerCase().startsWith("bearer ")) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        const token = header.slice(7).trim();

        if (!token || token.length < 32 || token.length > 256) {
            return res.status(401).json({
                message: "Invalid authentication token."
            });
        }

        const tokenHash = hashToken(token);

        const [rows] = await db.query(`
            SELECT
                s.id AS session_id,
                s.user_id,
                u.username,
                u.email,
                u.email_verified
            FROM auth_sessions s
            INNER JOIN users u ON u.id = s.user_id
            WHERE s.token_hash = ?
              AND s.expires_at > NOW()
            LIMIT 1
        `, [tokenHash]);

        if (rows.length === 0) {
            return res.status(401).json({
                message: "Your session has expired. Please log in again."
            });
        }

        req.user = {
            id: rows[0].user_id,
            username: rows[0].username,
            email: rows[0].email,
            emailVerified: Number(rows[0].email_verified) === 1,
            sessionId: rows[0].session_id,
            tokenHash
        };

        // Prevent a user from requesting another user's account.
        if (
            req.params &&
            Object.prototype.hasOwnProperty.call(req.params, "username")
        ) {
            const requested = String(req.params.username || "").trim();

            if (
                requested.toLowerCase() !==
                String(req.user.username).toLowerCase()
            ) {
                return res.status(403).json({
                    message: "You are not authorized to access this account."
                });
            }

            req.params.username = req.user.username;
        }

        next();
    } catch (error) {
        console.error("Authentication middleware error:", error);

        return res.status(500).json({
            message: "Authentication service unavailable."
        });
    }
}

function requireOwnBodyUsername(req, res, next) {
    const supplied = String(req.body?.username || "").trim();

    if (!supplied) {
        return res.status(400).json({
            message: "Username is required."
        });
    }

    if (
        supplied.toLowerCase() !==
        String(req.user.username).toLowerCase()
    ) {
        return res.status(403).json({
            message: "You are not authorized to access this account."
        });
    }

    req.body.username = req.user.username;
    next();
}

module.exports = {
    requireAuth,
    requireOwnBodyUsername
};