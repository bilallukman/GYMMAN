const AUTH_API = "https://gymman.onrender.com/api/auth";


// ==========================================
// PASSWORD RULES
// ==========================================

function passwordRules(value) {
    return {
        length: value.length >= 12,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[^A-Za-z0-9]/.test(value)
    };
}


function passwordHint(value) {

    const r = passwordRules(value);
    const missing = [];

    if (!r.length) {
        missing.push("12+ characters");
    }

    if (!r.upper) {
        missing.push("uppercase");
    }

    if (!r.lower) {
        missing.push("lowercase");
    }

    if (!r.number) {
        missing.push("number");
    }

    if (!r.special) {
        missing.push("special character");
    }

    return missing.length
        ? `Needs: ${missing.join(", ")}.`
        : "Strong password ✓";
}


// ==========================================
// RESET TOKEN
// ==========================================
// Supports the secure fragment format:
// reset-password.html#token=...
//
// Also temporarily supports the old format:
// reset-password.html?token=...
// ==========================================

function getResetToken() {

    const fragmentToken =
        new URLSearchParams(
            window.location.hash.slice(1)
        ).get("token");

    if (fragmentToken) {
        return fragmentToken;
    }

    return new URLSearchParams(
        window.location.search
    ).get("token");
}


// ==========================================
// AUTH API
// ==========================================

async function authPost(path, body) {

    const response =
        await fetch(
            `${AUTH_API}${path}`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(body)
            }
        );

    const data =
        await response.json()
            .catch(() => ({}));

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Something went wrong."
        );
    }

    return data;
}


// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotForm =
    document.getElementById("forgotForm");


if (forgotForm) {

    forgotForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const button =
                forgotForm.querySelector("button");

            const message =
                document.getElementById(
                    "forgotMessage"
                );

            message.textContent = "";

            button.disabled = true;

            button.textContent =
                "Sending...";


            try {

                const data =
                    await authPost(
                        "/forgot-password",
                        {
                            email:
                                document
                                    .getElementById(
                                        "email"
                                    )
                                    .value
                                    .trim()
                        }
                    );


                message.className =
                    "auth-success";

                message.textContent =
                    data.message;


            } catch (error) {

                message.textContent =
                    error.message;


            } finally {

                button.disabled = false;

                button.textContent =
                    "Send reset link";
            }
        }
    );
}


// ==========================================
// RESET PASSWORD
// ==========================================

const resetForm =
    document.getElementById("resetForm");


if (resetForm) {

    const password =
        document.getElementById("password");

    const hint =
        document.getElementById(
            "passwordHint"
        );


    password.addEventListener(
        "input",
        () => {

            const message =
                passwordHint(
                    password.value
                );

            hint.textContent =
                message;

            hint.className =
                password.value &&
                message.startsWith("Strong")
                    ? "password-hint valid"
                    : "password-hint";
        }
    );


    resetForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const message =
                document.getElementById(
                    "resetMessage"
                );

            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;

            const token =
                getResetToken();


            message.className =
                "error";

            message.textContent = "";


            if (!token) {

                message.textContent =
                    "This reset link is missing or invalid.";

                return;
            }


            if (
                !Object
                    .values(
                        passwordRules(
                            password.value
                        )
                    )
                    .every(Boolean)
            ) {

                message.textContent =
                    passwordHint(
                        password.value
                    );

                return;
            }


            if (
                password.value !==
                confirmPassword
            ) {

                message.textContent =
                    "Passwords do not match.";

                return;
            }


            const button =
                resetForm.querySelector(
                    "button"
                );

            button.disabled = true;

            button.textContent =
                "Updating...";


            try {

                const data =
                    await authPost(
                        "/reset-password",
                        {
                            token,
                            password:
                                password.value,
                            confirmPassword
                        }
                    );


                message.className =
                    "auth-success";

                message.textContent =
                    data.message;


                // Remove the token from the
                // browser URL after successful use.
                history.replaceState(
                    null,
                    "",
                    window.location.pathname
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "login.html";

                    },
                    1200
                );


            } catch (error) {

                message.textContent =
                    error.message;


            } finally {

                button.disabled = false;

                button.textContent =
                    "Update password";
            }
        }
    );
}