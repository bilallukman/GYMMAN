// ==========================================
// GYMMAN AUTHENTICATION
// ==========================================

// Production API
const API = "https://gymman.onrender.com/api/auth";// ==========================================
// PASSWORD HELPERS
// ==========================================

function passwordRules(password) {
    return {
        length: typeof password === "string" && password.length >= 6
    };
}

function passwordMessage(password) {
    return passwordRules(password).length
        ? "Password length looks good ✓"
        : "Password must be at least 6 characters.";
}

// Accessible show/hide controls used on login and registration pages.
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
// AUTH API
// ==========================================

async function postAuth(path, body) {

    const response = await fetch(
        `${API}${path}`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(body)
        }
    );


    const data =
        await response.json()
            .catch(() => ({}));


    if (!response.ok) {

        const error = new Error(
            data.message ||
            "Something went wrong."
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }


    return data;
}


// ==========================================
// REGISTER
// ==========================================

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    const passwordInput =
        document.getElementById("password");

    const confirmInput =
        document.getElementById("confirmPassword");

    const passwordHint =
        document.getElementById("passwordHint");

    const registerMessage =
        document.getElementById("registerMessage");


    function updatePasswordHint() {

        if (!passwordHint) {
            return;
        }


        const value =
            passwordInput.value;


        passwordHint.textContent =
            value
                ? passwordMessage(value)
                : "At least 6 characters";


        passwordHint.className =
            value.length >= 6
                ? "password-hint valid"
                : "password-hint";
    }


    passwordInput.addEventListener(
        "input",
        updatePasswordHint
    );


    registerForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            registerMessage.textContent = "";


            const username =
                document.getElementById("username")
                    .value
                    .trim();


            const email =
                document.getElementById("email")
                    .value
                    .trim();


            const password =
                passwordInput.value;


            const confirmPassword =
                confirmInput.value;


            if (password !== confirmPassword) {

                registerMessage.textContent =
                    "Passwords do not match.";

                return;
            }


            const rules =
                passwordRules(password);


            if (!Object.values(rules).every(Boolean)) {

                registerMessage.textContent =
                    passwordMessage(password);

                return;
            }


            const button =
                registerForm.querySelector('button[type="submit"]');


            button.disabled = true;

            button.textContent =
                "Creating account...";


            try {

                const data =
                    await postAuth(
                        "/register",
                        {
                            username,
                            email,
                            password
                        }
                    );


                alert(data.message);

                window.location.href =
                    "login.html";


            } catch (error) {

                registerMessage.textContent =
                    error.message;


            } finally {

                button.disabled = false;

                button.textContent =
                    "Create account";
            }
        }
    );


    updatePasswordHint();
}


// ==========================================
// LOGIN
// ==========================================

const loginForm =
    document.getElementById("loginForm");

const loginBtn =
    document.getElementById("loginBtn");

const verificationBox =
    document.getElementById("verificationBox");

const verificationMessage =
    document.getElementById("verificationMessage");

const resendVerificationBtn =
    document.getElementById(
        "resendVerificationBtn"
    );


// ==========================================
// SHOW VERIFICATION BOX
// ==========================================

function showVerificationBox(message) {

    if (!verificationBox) {
        return;
    }


    verificationBox.style.display =
        "block";


    if (verificationMessage) {

        verificationMessage.textContent =
            message ||
            "Please verify your email before logging in.";
    }
}


// ==========================================
// HIDE VERIFICATION BOX
// ==========================================

function hideVerificationBox() {

    if (!verificationBox) {
        return;
    }


    verificationBox.style.display =
        "none";
}


// ==========================================
// LOGIN
// ==========================================

if (loginForm && loginBtn) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const identifier =
                document.getElementById("username")
                    .value
                    .trim();


            const password =
                document.getElementById("password")
                    .value;


            const error =
                document.getElementById("error");


            error.textContent = "";

            hideVerificationBox();


            loginBtn.disabled = true;

            loginBtn.textContent =
                "Signing in...";


            try {

                const data =
                    await postAuth(
                        "/login",
                        {
                            username: identifier,
                            password
                        }
                    );


                // Login successful
                sessionStorage.setItem(
                    "accessToken",
                    data.accessToken
                );


                localStorage.setItem(
                    "currentUser",
                    data.user.username
                );


                window.location.href =
                    "dashboard.html";


            } catch (err) {

                error.textContent =
                    err.message;


            } finally {

                loginBtn.disabled = false;

                loginBtn.textContent =
                    "Log in";
            }
        }
    );
}


// ==========================================
// RESEND VERIFICATION EMAIL
// ==========================================

if (resendVerificationBtn) {

    resendVerificationBtn.addEventListener(
        "click",
        async () => {

            const email =
                document.getElementById("username")
                    .value
                    .trim();


            const error =
                document.getElementById("error");


            error.textContent = "";


            if (!email) {

                error.textContent =
                    "Enter your email address first.";

                return;
            }


            if (!email.includes("@")) {

                error.textContent =
                    "Enter your email address in the field above.";

                return;
            }


            resendVerificationBtn.disabled =
                true;


            resendVerificationBtn.textContent =
                "Sending...";


            try {

                const data =
                    await postAuth(
                        "/resend-verification",
                        {
                            email
                        }
                    );


                if (verificationMessage) {

                    verificationMessage.textContent =
                        data.message ||
                        "A new verification email has been sent. Check your inbox.";
                }


                resendVerificationBtn.textContent =
                    "Email sent ✓";


            } catch (err) {

                error.textContent =
                    err.message ||
                    "Unable to send verification email.";

                resendVerificationBtn.textContent =
                    "Resend verification email";


            } finally {

                resendVerificationBtn.disabled =
                    false;
            }
        }
    );
}