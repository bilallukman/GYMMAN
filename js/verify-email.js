// ==========================================
// GYMMAN EMAIL VERIFICATION
// ==========================================

(function () {

    // ==========================================
    // GET VERIFICATION TOKEN
    // ==========================================
    // Supports the secure fragment format:
    // verify-email.html#token=...
    //
    // Also temporarily supports the old format:
    // verify-email.html?token=...
    //
    // The email service will be changed later
    // to generate fragment-based links only.
    // ==========================================

    function getVerificationToken() {

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


    const token =
        getVerificationToken();


    const title =
        document.getElementById("verifyTitle");

    const message =
        document.getElementById("verifyMessage");


    // ==========================================
    // CHECK TOKEN
    // ==========================================

    if (!token) {

        title.textContent =
            "Invalid verification link";

        message.textContent =
            "The verification token is missing. Please use the link from your GYMMAN email.";

        return;
    }


    // ==========================================
    // API URL
    // ==========================================

    const API =
        `${window.location.protocol}//${window.location.hostname}:3000/api/auth`;


    // ==========================================
    // VERIFY
    // ==========================================

    async function verifyEmail() {

        title.textContent =
            "Verifying your email...";

        message.textContent =
            "Please wait while GYMMAN checks your verification link.";


        try {

            const response =
                await fetch(
                    `${API}/verify-email`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            token: token
                        })
                    }
                );


            const data =
                await response.json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to verify your email."
                );
            }


            // ==========================================
            // SUCCESS
            // ==========================================

            title.textContent =
                "Email verified ✓";

            message.textContent =
                data.message ||
                "Email verified successfully. You can now log in.";


            // Remove the token from the
            // browser URL after successful use.
            history.replaceState(
                null,
                "",
                window.location.pathname
            );


        } catch (error) {

            console.error(
                "Email verification error:",
                error
            );


            title.textContent =
                "Verification failed";

            message.textContent =
                error.message ||
                "Unable to verify your email.";
        }
    }


    verifyEmail();

})();