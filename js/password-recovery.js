const API = "https://gymman.onrender.com/api/auth";// PASSWORD RULES
// ==========================================

function passwordRules(value) {
    return { length: typeof value === "string" && value.length >= 6 };
}

function passwordHint(value) {
    return passwordRules(value).length
        ? "Password length looks good ✓"
        : "Password must be at least 6 characters.";
}

// Show/hide password controls on the reset-password page.
document.querySelectorAll("[data-password-toggle]").forEach(toggle => {
    const input = document.getElementById(toggle.dataset.passwordToggle);
    if (!input) return;
    toggle.addEventListener("click", () => {
        const showPassword = input.type === "password";
        input.type = showPassword ? "text" : "password";
        toggle.setAttribute("aria-pressed", String(showPassword));
        toggle.setAttribute("aria-label", `${showPassword ? "Hide" : "Show"} ${toggle.dataset.passwordToggle === "confirmPassword" ? "confirm password" : "password"}`);
        toggle.title = showPassword ? "Hide password" : "Show password";
        toggle.innerHTML = showPassword
            ? '<svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.8"/><path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8"/></svg>'
            : '<svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
});

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
            `${API}${path}`,
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
                password.value.length >= 6
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
                resetForm.querySelector('button[type="submit"]');

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