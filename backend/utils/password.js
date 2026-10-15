const crypto = require("crypto");

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

// Password hashing strength
const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_MAXMEM = 64 * 1024 * 1024;


function hashPassword(password) {

    const salt = crypto
        .randomBytes(SALT_LENGTH)
        .toString("hex");

    const hash = crypto.scryptSync(
        password,
        salt,
        KEY_LENGTH,
        {
            N: SCRYPT_N,
            r: SCRYPT_R,
            p: SCRYPT_P,
            maxmem: SCRYPT_MAXMEM
        }
    ).toString("hex");

    return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${hash}`;
}


function verifyPassword(password, stored) {

    if (
        !stored ||
        !stored.startsWith("scrypt$")
    ) {
        return false;
    }

    const parts = stored.split("$");

    // Format:
    // scrypt$N$r$p$salt$hash
    if (parts.length !== 6) {
        return false;
    }

    const [
        ,
        n,
        r,
        p,
        salt,
        storedHash
    ] = parts;

    try {

        const N = Number(n);
        const R = Number(r);
        const P = Number(p);

        // Reject invalid scrypt parameters.
        if (
            !Number.isInteger(N) ||
            !Number.isInteger(R) ||
            !Number.isInteger(P) ||
            N <= 1 ||
            (N & (N - 1)) !== 0 ||
            R <= 0 ||
            P <= 0
        ) {
            return false;
        }

        const hash = crypto.scryptSync(
            password,
            salt,
            KEY_LENGTH,
            {
                N,
                r: R,
                p: P,
                maxmem: SCRYPT_MAXMEM
            }
        );

        const expected = Buffer.from(
            storedHash,
            "hex"
        );

        return (
            expected.length === hash.length &&
            crypto.timingSafeEqual(
                expected,
                hash
            )
        );

    } catch (error) {

        console.error(
            "Password verification error:",
            error.message
        );

        return false;
    }
}


function isLegacyPassword(stored) {

    return (
        !!stored &&
        !stored.startsWith("scrypt$")
    );
}


function validatePassword(password) {
    if (typeof password !== "string" || password.length === 0) {
        return "Password is required.";
    }
    if (password.length < 6) {
        return "Password must be at least 6 characters.";
    }
    if (password.length > 128) {
        return "Password must be 128 characters or fewer.";
    }
    return null;
}

function createToken() {

    return crypto
        .randomBytes(32)
        .toString("hex");
}


function hashToken(token) {

    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}


module.exports = {
    hashPassword,
    verifyPassword,
    isLegacyPassword,
    validatePassword,
    createToken,
    hashToken
};