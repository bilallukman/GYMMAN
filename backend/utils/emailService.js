require("dotenv").config();

const APP_URL = (
    process.env.APP_URL ||
    "http://localhost:5500"
).replace(/\/$/, "");

const RESEND_API_KEY =
    process.env.RESEND_API_KEY;

const EMAIL_FROM =
    process.env.EMAIL_FROM ||
    "GYMMAN <onboarding@resend.dev>";


// ==========================================
// SEND EMAIL
// ==========================================

async function sendEmail({ to, subject, html }) {

    if (!RESEND_API_KEY) {

        throw new Error(
            "Email service is not configured."
        );
    }


    const response =
        await fetch(
            "https://api.resend.com/emails",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${RESEND_API_KEY}`,

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    from: EMAIL_FROM,
                    to: [to],
                    subject,
                    html
                })
            }
        );


    if (!response.ok) {

        const body =
            await response.text();

        throw new Error(
            `Email provider error: ${response.status} ${body}`
        );
    }


    return true;
}


// ==========================================
// VERIFICATION EMAIL
// ==========================================

async function sendVerificationEmail(
    email,
    username,
    token
) {

    // Token is stored in the URL fragment.
    // Fragments are not sent as part of the HTTP request.
    const link =
        `${APP_URL}/pages/verify-email.html#token=${encodeURIComponent(token)}`;


    return sendEmail({

        to: email,

        subject:
            "Verify your GYMMAN account",

        html: `
            <div style="
                font-family:Arial,sans-serif;
                max-width:560px;
                margin:auto;
                color:#14213d;
            ">

                <h1>GYMMAN</h1>

                <p>
                    Hi ${escapeHtml(username)},
                </p>

                <p>
                    Verify your email address to activate
                    your GYMMAN account.
                </p>

                <p>
                    <a
                        href="${link}"
                        style="
                            display:inline-block;
                            padding:12px 18px;
                            background:#2563eb;
                            color:white;
                            text-decoration:none;
                            border-radius:8px;
                        "
                    >
                        Verify email
                    </a>
                </p>

                <p>
                    This link expires in 24 hours.
                </p>

            </div>
        `
    });
}


// ==========================================
// PASSWORD RESET EMAIL
// ==========================================

async function sendPasswordResetEmail(
    email,
    username,
    token
) {

    // Token is stored in the URL fragment.
    // Fragments are not sent as part of the HTTP request.
    const link =
        `${APP_URL}/pages/reset-password.html#token=${encodeURIComponent(token)}`;


    return sendEmail({

        to: email,

        subject:
            "Reset your GYMMAN password",

        html: `
            <div style="
                font-family:Arial,sans-serif;
                max-width:560px;
                margin:auto;
                color:#14213d;
            ">

                <h1>GYMMAN</h1>

                <p>
                    Hi ${escapeHtml(username)},
                </p>

                <p>
                    We received a request to reset
                    your GYMMAN password.
                </p>

                <p>
                    <a
                        href="${link}"
                        style="
                            display:inline-block;
                            padding:12px 18px;
                            background:#2563eb;
                            color:white;
                            text-decoration:none;
                            border-radius:8px;
                        "
                    >
                        Reset password
                    </a>
                </p>

                <p>
                    This link expires in 30 minutes.
                    If you did not request this,
                    you can ignore this email.
                </p>

            </div>
        `
    });
}


// ==========================================
// APP URL
// ==========================================

function getAppUrl() {

    return APP_URL;
}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    getAppUrl
};