// ==========================================
// LIFT — PROFILE
// ==========================================

(async function () {

    try {

        // ==========================================
        // LOAD USER DATA
        // ==========================================

        const data = await window.LIFT.get(
            `/user/${encodeURIComponent(window.LIFT.username)}`
        );

        const u = data.user;


        // ==========================================
        // UNIT PREFERENCES
        // ==========================================

        const weightUnit =
            typeof window.LIFT.getWeightUnit === "function"
                ? window.LIFT.getWeightUnit()
                : "kg";

        const heightUnit =
            typeof window.LIFT.getHeightUnit === "function"
                ? window.LIFT.getHeightUnit()
                : "cm";


        // ==========================================
        // BASIC PROFILE
        // ==========================================

        document.getElementById("profileAvatar").textContent =
            u.username.charAt(0).toUpperCase();

        document.getElementById("profileName").textContent =
            u.username;

        document.getElementById("profileEmail").textContent =
            u.email;


        // ==========================================
        // FITNESS INFORMATION
        // ==========================================

        document.getElementById("detailUsername").textContent =
            u.username;

        document.getElementById("detailEmail").textContent =
            u.email;


        document.getElementById("detailHeight").textContent =
            u.height
                ? formatHeight(u.height)
                : "Not added";


        document.getElementById("detailWeight").textContent =
            u.weight
                ? formatWeight(u.weight)
                : "Not added";


        document.getElementById("detailBmi").textContent =
            u.bmi !== null && u.bmi !== undefined
                ? formatNumber(u.bmi)
                : "Not calculated";


        document.getElementById("detailDiet").textContent =
            u.hasDiet
                ? "Added"
                : "Not added";


        document.getElementById("detailCreated").textContent =
            u.createdAt
                ? formatDate(u.createdAt)
                : "—";


        // ==========================================
        // EMAIL VERIFICATION STATUS
        // ==========================================

        const verification =
            document.getElementById("detailVerification");

        if (verification) {

            const emailIsVerified =
                u.emailVerified === true ||
                Number(u.emailVerified) === 1 ||
                u.email_verified === true ||
                Number(u.email_verified) === 1;


            if (emailIsVerified) {

                verification.textContent =
                    "Verified ✓";

                verification.className =
                    "status-badge";

            } else {

                verification.textContent =
                    "Not verified";

                verification.className =
                    "status-badge status-badge-warning";
            }
        }


        // ==========================================
        // PROFILE TRAINING TOTALS
        // ==========================================

        document.getElementById("profileTotalSets").textContent =
            u.totalSets || 0;

        document.getElementById("profileTotalReps").textContent =
            formatNumber(u.totalReps || 0);

        document.getElementById("profileTotalVolume").textContent =
            formatWeight(u.totalVolume || 0);


        // ==========================================
        // TOP MUSCLE
        // ==========================================

        const muscleValues =
            u.progress || {};

        let topMuscle = "—";
        let highest = 0;

        Object.entries(muscleValues).forEach(
            ([muscle, sets]) => {

                if (Number(sets) > highest) {

                    highest =
                        Number(sets);

                    topMuscle =
                        capitalize(muscle);
                }
            }
        );

        document.getElementById("profileTopMuscle").textContent =
            topMuscle;


        // ==========================================
        // MUSCLE FOCUS
        // ==========================================

        const muscles = [

            ["Chest", muscleValues.chest || 0],
            ["Back", muscleValues.back || 0],
            ["Shoulders", muscleValues.shoulders || 0],
            ["Legs", muscleValues.legs || 0],
            ["Arms", muscleValues.arms || 0],
            ["Core", muscleValues.core || 0],
            ["Cardio", muscleValues.cardio || 0]

        ];


        const maxMuscle =
            Math.max(
                1,
                ...muscles.map(
                    item => Number(item[1]) || 0
                )
            );


        const muscleContainer =
            document.getElementById("profileMuscles");

        if (muscleContainer) {

            muscleContainer.innerHTML =

                muscles.map(
                    ([name, value]) => {

                        const percentage =
                            Math.min(
                                100,
                                (
                                    Number(value) /
                                    maxMuscle
                                ) * 100
                            );


                        return `

                            <div class="progress-row">

                                <label>
                                    ${escapeHtml(name)}
                                </label>

                                <div class="progress-track">

                                    <div
                                        class="progress-fill"
                                        style="width:${percentage}%"
                                    ></div>

                                </div>

                                <span>
                                    ${Number(value) || 0}
                                </span>

                            </div>

                        `;
                    }
                ).join("");
        }


        // ==========================================
        // TRAINING ACTIVITY
        // ==========================================

        const activity =
            u.activityHistory || [];

        renderActivityChart(activity);


        // ==========================================
        // WEIGHT HISTORY
        // ==========================================

        const weightHistory =
            u.weightHistory || [];

        renderWeightHistory(weightHistory);


        // ==========================================
        // PERSONAL RECORDS
        // ==========================================

        const records =
            u.personalRecords || [];

        renderRecords(records);


        // ==========================================
        // RECENT WORKOUTS
        // ==========================================

        const recentWorkouts =
            u.recentWorkouts || [];

        renderRecentWorkouts(recentWorkouts);


        // ==========================================
        // EDIT PROFILE
        // ==========================================

        setupEditProfile(u);


    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

        if (
            window.LIFT &&
            typeof window.LIFT.toast === "function"
        ) {

            window.LIFT.toast(
                "Unable to load your profile."
            );
        }
    }


    // ==========================================
    // LOGOUT
    // ==========================================

    const logoutButton =
        document.getElementById("profileLogout");

    if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                if (
                    window.LIFT &&
                    typeof window.LIFT.request === "function"
                ) {

                    await window.LIFT.request(
                        "/auth/logout",
                        {
                            method: "POST"
                        }
                    );
                }

            } catch (error) {

                console.warn(
                    "Logout request failed:",
                    error
                );

            } finally {

                sessionStorage.removeItem(
                    "accessToken"
                );

                localStorage.removeItem(
                    "currentUser"
                );

                window.location.href =
                    "login.html";
            }
        }
    );
}


    // ==========================================
    // EDIT PROFILE
    // ==========================================

    function setupEditProfile(user) {

        const editButton =
            document.getElementById("editProfileBtn");

        const panel =
            document.getElementById("profileEditPanel");

        const backdrop =
            document.getElementById("profileEditBackdrop");

        const closeButton =
            document.getElementById("closeProfileEdit");

        const cancelButton =
            document.getElementById("cancelProfileEdit");

        const form =
            document.getElementById("profileEditForm");

        const message =
            document.getElementById("profileEditMessage");

        const saveButton =
            document.getElementById("saveProfileBtn");

        const usernameInput =
            document.getElementById("editUsername");

        const emailInput =
            document.getElementById("editEmail");

        const currentPasswordInput =
            document.getElementById("editCurrentPassword");

        const newPasswordInput =
            document.getElementById("editNewPassword");

        const confirmPasswordInput =
            document.getElementById("editConfirmPassword");

        const previewAvatar =
            document.getElementById("editProfileAvatar");

        const previewName =
            document.getElementById("editProfileNamePreview");


        if (
            !editButton ||
            !panel ||
            !form
        ) {
            return;
        }


        // ==========================================
        // UPDATE PREVIEW
        // ==========================================

        function updatePreview() {

            const username =
                usernameInput.value.trim();

            previewName.textContent =
                username || "Your profile";

            previewAvatar.textContent =
                username
                    ? username.charAt(0).toUpperCase()
                    : "B";
        }


        // ==========================================
        // OPEN EDITOR
        // ==========================================

        function openEditor() {

            usernameInput.value =
                user.username || "";

            emailInput.value =
                user.email || "";

            currentPasswordInput.value =
                "";

            newPasswordInput.value =
                "";

            confirmPasswordInput.value =
                "";

            message.textContent =
                "";

            message.className =
                "profile-form-message";

            updatePreview();

            panel.hidden = false;

            document.body.style.overflow =
                "hidden";

            setTimeout(
                () => currentPasswordInput.focus(),
                50
            );
        }


        // ==========================================
        // CLOSE EDITOR
        // ==========================================

        function closeEditor() {

            panel.hidden = true;

            document.body.style.overflow =
                "";
        }


        editButton.addEventListener(
            "click",
            openEditor
        );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeEditor
            );
        }


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeEditor
            );
        }


        if (backdrop) {

            backdrop.addEventListener(
                "click",
                closeEditor
            );
        }


        usernameInput.addEventListener(
            "input",
            updatePreview
        );


        // ==========================================
        // ESCAPE KEY
        // ==========================================

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape" &&
                    !panel.hidden
                ) {
                    closeEditor();
                }
            }
        );


        // ==========================================
        // SAVE PROFILE
        // ==========================================

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                message.textContent =
                    "";

                message.className =
                    "profile-form-message";


                const username =
                     usernameInput.value.trim();

                const email =
                    emailInput.value
                        .trim()
                        .toLowerCase();

                const currentPassword =
                    currentPasswordInput.value;

                const newPassword =
                    newPasswordInput.value;

                const confirmPassword =
                    confirmPasswordInput.value;


                // ==========================================
                // USERNAME
                // ==========================================

                if (
                    username.length < 3 ||
                    username.length > 30
                ) {

                    showFormError(
                        "Username must be 3–30 characters."
                    );

                    return;
                }


                if (
                    !/^[A-Za-z0-9_.]+$/.test(
                        username
                    )
                ) {

                    showFormError(
                        "Username can contain letters, numbers, underscores and dots only."
                    );

                    return;
                }


                // ==========================================
                // EMAIL
                // ==========================================

                if (
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                        email
                    )
                ) {

                    showFormError(
                        "Enter a valid email address."
                    );

                    return;
                }


                // ==========================================
                // CURRENT PASSWORD
                // ==========================================

                if (!currentPassword) {

                    showFormError(
                        "Enter your current password to save changes."
                    );

                    return;
                }


                // ==========================================
                // NEW PASSWORD
                // ==========================================

                if (
                    newPassword ||
                    confirmPassword
                ) {

                    if (
                        newPassword !==
                        confirmPassword
                    ) {

                        showFormError(
                            "New passwords do not match."
                        );

                        return;
                    }


                    if (newPassword.length < 6) {
                        showFormError(
                            "New password must be at least 6 characters."
                        );
                        return;
                    }

                    if (newPassword.length > 128) {
                        showFormError(
                            "New password must be 128 characters or fewer."
                        );
                        return;
                    }
                }


                // ==========================================
                // SAVE
                // ==========================================

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Saving...";


                try {

                    const currentUsername =
                        window.LIFT.username;


                    const response =
                        await window.LIFT.request(
                            `/user/${encodeURIComponent(currentUsername)}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        username,

                                        email,

                                        currentPassword,

                                        newPassword:
                                            newPassword || ""

                                    })
                            }
                        );


                    const data =
                        await response
                            .json()
                            .catch(
                                () => ({})
                            );


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Unable to update your profile."
                        );
                    }


                    // ==========================================
                    // UPDATE LOCAL USER
                    // ==========================================

                    localStorage.setItem(
                        "currentUser",
                        data.user.username
                    );

                    window.LIFT.username =
                        data.user.username;


                    // ==========================================
                    // UPDATE PAGE
                    // ==========================================

                    const profileName =
                        document.getElementById(
                            "profileName"
                        );

                    if (profileName) {

                        profileName.textContent =
                            data.user.username;
                    }


                    const profileEmail =
                        document.getElementById(
                            "profileEmail"
                        );

                    if (profileEmail) {

                        profileEmail.textContent =
                            data.user.email;
                    }


                    const detailUsername =
                        document.getElementById(
                            "detailUsername"
                        );

                    if (detailUsername) {

                        detailUsername.textContent =
                            data.user.username;
                    }


                    const detailEmail =
                        document.getElementById(
                            "detailEmail"
                        );

                    if (detailEmail) {

                        detailEmail.textContent =
                            data.user.email;
                    }


                    const profileAvatar =
                        document.getElementById(
                            "profileAvatar"
                        );

                    if (profileAvatar) {

                        profileAvatar.textContent =
                            data.user.username
                                .charAt(0)
                                .toUpperCase();
                    }


                    // ==========================================
                    // UPDATED EMAIL STATUS
                    // ==========================================

                    const verification =
                        document.getElementById(
                            "detailVerification"
                        );


                    if (verification) {

                        const emailIsVerified =
                            data.user.emailVerified === true ||
                            Number(data.user.emailVerified) === 1 ||
                            data.user.email_verified === true ||
                            Number(data.user.email_verified) === 1;


                        if (emailIsVerified) {

                            verification.textContent =
                                "Verified ✓";

                            verification.className =
                                "status-badge";

                        } else {

                            verification.textContent =
                                "Not verified";

                            verification.className =
                                "status-badge status-badge-warning";
                        }
                    }


                    // ==========================================
                    // SUCCESS
                    // ==========================================

                    message.textContent =
                        data.message ||
                        "Profile updated successfully.";

                    message.className =
                        "profile-form-message success";


                    if (
                        window.LIFT &&
                        typeof window.LIFT.toast === "function"
                    ) {

                        window.LIFT.toast(
                            data.message ||
                            "Profile updated successfully."
                        );
                    }


                    setTimeout(
                        closeEditor,
                        1000
                    );


                } catch (error) {

                    console.error(
                        "Profile update error:",
                        error
                    );

                    showFormError(
                        error.message ||
                        "Unable to update your profile."
                    );


                } finally {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        "Save changes";
                }

            }
        );


        // ==========================================
        // FORM ERROR
        // ==========================================

        function showFormError(text) {

            message.textContent =
                text;

            message.className =
                "profile-form-message";
        }
    }


    // ==========================================
    // ACTIVITY CHART
    // ==========================================

    function renderActivityChart(activity) {

        const container =
            document.getElementById(
                "profileActivityChart"
            );


        if (!container) {
            return;
        }


        if (!activity.length) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No activity yet
                    </h3>

                    <p>
                        Log workouts to start seeing your training activity.
                    </p>

                </div>

            `;

            return;
        }


        const recent =
            activity.slice(-14);


        const max =
            Math.max(
                1,
                ...recent.map(
                    item =>
                        Number(item.workouts) || 0
                )
            );


        container.innerHTML =
            recent.map(
                item => {

                    const count =
                        Number(item.workouts) || 0;


                    const height =
                        Math.max(
                            8,
                            (count / max) * 100
                        );


                    const date =
                        new Date(
                            `${item.day}T00:00:00`
                        );


                    const label =
                        date.toLocaleDateString(
                            undefined,
                            {
                                weekday: "short"
                            }
                        ).slice(0, 2);


                    return `

                        <div class="profile-chart-day">

                            <div class="profile-chart-bar-wrap">

                                <div
                                    class="profile-chart-bar"
                                    style="height:${height}%"
                                    title="${count} workout${count === 1 ? "" : "s"}"
                                ></div>

                            </div>

                            <strong>
                                ${count}
                            </strong>

                            <span>
                                ${escapeHtml(label)}
                            </span>

                        </div>

                    `;
                }
            ).join("");
    }


    // ==========================================
    // WEIGHT HISTORY
    // ==========================================

    function renderWeightHistory(history) {

        const container =
            document.getElementById(
                "profileWeightHistory"
            );


        if (!container) {
            return;
        }


        if (!history.length) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No weight history yet
                    </h3>

                    <p>
                        Save BMI measurements to start tracking your weight.
                    </p>

                    <a
                        class="btn btn-primary"
                        href="bmi.html"
                    >
                        Add measurement
                    </a>

                </div>

            `;

            return;
        }


        const latest =
            history[
                history.length - 1
            ];


        const first =
            history[0];


        const currentWeight =
            Number(latest.weight) || 0;


        const startingWeight =
            Number(first.weight) || 0;


        const change =
            currentWeight -
            startingWeight;


        const changeText =
            change === 0
                ? "No change"
                : `${change > 0 ? "+" : ""}${formatWeight(change)}`;


        container.innerHTML = `

            <div class="weight-summary">

                <div class="weight-current">

                    <span>
                        CURRENT WEIGHT
                    </span>

                    <strong>
                        ${formatWeight(currentWeight)}
                    </strong>

                </div>


                <div class="weight-change">

                    <span>
                        CHANGE
                    </span>

                    <strong>
                        ${escapeHtml(changeText)}
                    </strong>

                </div>

            </div>


            <div class="weight-history-list">

                ${
                    history
                        .slice()
                        .reverse()
                        .slice(0, 8)
                        .map(item => {

                            const weight =
                                Number(item.weight) || 0;


                            return `

                                <div class="weight-history-row">

                                    <div>

                                        <strong>
                                            ${formatWeight(weight)}
                                        </strong>

                                        <span>
                                            ${formatDate(item.created_at)}
                                        </span>

                                    </div>

                                    <span>
                                        BMI ${item.bmi ?? "—"}
                                    </span>

                                </div>

                            `;

                        })
                        .join("")
                }

            </div>

        `;
    }


    // ==========================================
    // PERSONAL RECORDS
    // ==========================================

    function renderRecords(records) {

        const container =
            document.getElementById(
                "profileRecords"
            );


        if (!container) {
            return;
        }


        if (!records.length) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No personal records yet
                    </h3>

                    <p>
                        Log weighted exercises to build your records.
                    </p>

                </div>

            `;

            return;
        }


        container.innerHTML =
            records
                .slice(0, 8)
                .map(record => `

                    <article class="record-card">

                        <div class="record-icon">
                            PR
                        </div>


                        <div class="record-content">

                            <strong>
                                ${escapeHtml(record.exercise)}
                            </strong>

                            <span>
                                ${escapeHtml(record.muscle)}
                            </span>

                        </div>


                        <div class="record-result">

                            <strong>
                                ${formatWeight(record.weight)}
                            </strong>

                            <span>
                                Best recorded
                            </span>

                        </div>

                    </article>

                `)
                .join("");
    }


    // ==========================================
    // RECENT WORKOUTS
    // ==========================================

    function renderRecentWorkouts(workouts) {

        const container =
            document.getElementById(
                "profileRecentWorkouts"
            );


        if (!container) {
            return;
        }


        if (!workouts.length) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No workouts yet
                    </h3>

                    <p>
                        Start logging workouts to see your recent activity here.
                    </p>

                    <a
                        class="btn btn-primary"
                        href="workout.html"
                    >
                        Log workout
                    </a>

                </div>

            `;

            return;
        }


        container.innerHTML =
            workouts
                .map(workout => {

                    const weight =
                        Number(workout.weight) || 0;


                    return `

                        <div class="workout-item">

                            <div class="activity-dot">

                                ${escapeHtml(
                                    workout.muscle
                                )
                                    .slice(0, 2)
                                    .toUpperCase()}

                            </div>


                            <div class="workout-main">

                                <strong>
                                    ${escapeHtml(
                                        workout.exercise
                                    )}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        workout.muscle
                                    )}
                                </span>

                            </div>


                            <div class="workout-meta">

                                <span class="meta-pill">
                                    ${formatWeight(weight)}
                                </span>

                                <span class="meta-pill">
                                    ${workout.sets} sets
                                </span>

                                <span class="meta-pill">
                                    ${workout.reps} reps
                                </span>

                            </div>

                        </div>

                    `;
                })
                .join("");
    }


    // ==========================================
    // FORMAT WEIGHT
    // ==========================================

    function formatWeight(value) {

        const kg =
            Number(value) || 0;

        if (
            window.LIFT &&
            typeof window.LIFT.formatWeight === "function"
        ) {
            return window.LIFT.formatWeight(
                kg,
                "kg"
            );
        }

        return `${formatNumber(kg)} kg`;
    }


    // ==========================================
    // FORMAT HEIGHT
    // ==========================================

    function formatHeight(value) {

        const cm =
            Number(value) || 0;

        if (
            window.LIFT &&
            typeof window.LIFT.formatHeight === "function"
        ) {
            return window.LIFT.formatHeight(
                cm,
                "cm"
            );
        }

        return `${formatNumber(cm)} cm`;
    }


    // ==========================================
    // FORMAT NUMBER
    // ==========================================

    function formatNumber(value) {

        return Number(
            value || 0
        ).toLocaleString(
            undefined,
            {
                maximumFractionDigits: 1
            }
        );
    }


    // ==========================================
    // FORMAT DATE
    // ==========================================

    function formatDate(value) {

        if (!value) {
            return "—";
        }


        try {

            let normalized =
                String(value);


            if (
                normalized.includes(" ") &&
                !normalized.includes("T")
            ) {

                normalized =
                    normalized.replace(
                        " ",
                        "T"
                    );
            }


            const date =
                new Date(normalized);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return String(value)
                    .slice(0, 10);
            }


            return date.toLocaleDateString(
                undefined,
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );


        } catch {

            return String(value)
                .slice(0, 10);
        }
    }


    // ==========================================
    // CAPITALIZE
    // ==========================================

    function capitalize(value) {

        return String(value)
            .charAt(0)
            .toUpperCase() +

            String(value)
                .slice(1);
    }


    // ==========================================
    // ESCAPE HTML
    // ==========================================

    function escapeHtml(value) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            value ?? "";

        return div.innerHTML;
    }

})();