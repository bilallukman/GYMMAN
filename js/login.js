// ==========================================
// LIFT AUTHENTICATION
// ==========================================

// Automatically uses the same host as the frontend.
// PC:     http://localhost:3000
// Phone:  http://192.168.1.35:3000
// Deploy: https://your-domain.com:3000

const API = "https://gymman.onrender.com/api/auth";

// ==========================================
// PASSWORD HELPERS
// ==========================================

function passwordRules(password) {
    return {
        length: password.length >= 12,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
}


function passwordMessage(password) {

    const rules = passwordRules(password);
    const missing = [];

    if (!rules.length) {
        missing.push("12+ characters");
    }

    if (!rules.upper) {
        missing.push("uppercase");
    }

    if (!rules.lower) {
        missing.push("lowercase");
    }

    if (!rules.number) {
        missing.push("number");
    }

    if (!rules.special) {
        missing.push("special character");
    }

    return missing.length
        ? `Needs: ${missing.join(", ")}.`
        : "Strong password ✓";
}


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
                : "12+ chars • uppercase • lowercase • number • special character";


        passwordHint.className =
            value &&
            passwordMessage(value).startsWith("Strong")
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
                registerForm.querySelector("button");


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