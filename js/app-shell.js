// ==========================================
// GYMMAN SHARED LOGGED-IN APPLICATION SHELL
// ==========================================

(function () {

    // ==========================================
    // CHECK LOGIN
    // ==========================================

    const accessToken =
        sessionStorage.getItem("accessToken");

    let username =
        localStorage.getItem("currentUser") || "";

    if (!accessToken) {
        window.location.href = "login.html";
        return;
    }

    const apiBase =
    "https://gymman.onrender.com/api";

    const authReady = (async () => {
        const response = await fetch(
            `${apiBase}/auth/me`,
            {
                headers: {
                    Authorization:
                        `Bearer ${accessToken}`
                },
                cache: "no-store"
            }
        );

        if (!response.ok) {
            sessionStorage.removeItem("accessToken");
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
            throw new Error("Authentication required.");
        }

        const data = await response.json();

        localStorage.setItem(
            "currentUser",
            data.user.username
        );

        username = data.user.username;

        if (window.LIFT) {
            window.LIFT.username = username;
        }

        return data.user;
    })();

    async function authenticatedFetch(path, options = {}) {
        await authReady;

        const headers = new Headers(
            options.headers || {}
        );

        headers.set(
            "Authorization",
            `Bearer ${accessToken}`
        );

        return fetch(
            `${apiBase}${path}`,
            {
                ...options,
                headers
            }
        );
    }


    const page =
        document.body.dataset.page || "home";


    // ==========================================
    // GYMMAN SETTINGS / PREFERENCES
    // ==========================================

    const defaultSettings = {
        weightUnit: "kg",
        heightUnit: "cm",
        startDay: "monday",
        theme: "light"
    };


    function getSettings() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem("liftSettings") || "{}"
                );

            return {
                ...defaultSettings,
                ...saved
            };

        } catch (error) {

            console.warn(
                "Unable to read Gymman settings.",
                error
            );

            return {
                ...defaultSettings
            };

        }

    }


    const settings =
        getSettings();


    // ==========================================
    // APPLY THEME
    // ==========================================

    function applyTheme() {

        let theme =
            settings.theme || "light";


        if (theme === "system") {

            const prefersDark =
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches;

            theme =
                prefersDark
                    ? "dark"
                    : "light";
        }


        document.documentElement
            .setAttribute(
                "data-theme",
                theme
            );


        /*
         * GYMMAN dark theme.
         * Added here so every logged-in page
         * automatically follows Settings.
         */

        let darkStyle =
            document.getElementById(
                "lift-dark-theme"
            );


        if (!darkStyle) {

            darkStyle =
                document.createElement("style");

            darkStyle.id =
                "lift-dark-theme";

            document.head.appendChild(
                darkStyle
            );

        }


        if (theme === "dark") {

            darkStyle.textContent = `

                html[data-theme="dark"] body {
                    background: #0b1220 !important;
                    color: #e8eef8 !important;
                }

                html[data-theme="dark"] .app-main {
                    background: #0b1220 !important;
                }

                html[data-theme="dark"] .app-sidebar {
                    background: #111827 !important;
                    border-color: #1f2937 !important;
                }

                html[data-theme="dark"] .app-logo,
                html[data-theme="dark"] .sidebar-section-label,
                html[data-theme="dark"] .app-nav a,
                html[data-theme="dark"] .user-mini,
                html[data-theme="dark"] .user-mini-info span {
                    color: #d6deeb !important;
                }

                html[data-theme="dark"] .app-nav a:hover {
                    background: #1a2535 !important;
                }

                html[data-theme="dark"] .app-nav a.active {
                    background: #172a52 !important;
                    color: #6ea8ff !important;
                }

                html[data-theme="dark"] .settings-card,
                html[data-theme="dark"] .profile-card,
                html[data-theme="dark"] .card,
                html[data-theme="dark"] .panel,
                html[data-theme="dark"] .stat-card,
                html[data-theme="dark"] .exercise-card,
                html[data-theme="dark"] .workout-card,
                html[data-theme="dark"] .content-card {
                    background: #111827 !important;
                    border-color: #263244 !important;
                    color: #e8eef8 !important;
                }

                html[data-theme="dark"] h1,
                html[data-theme="dark"] h2,
                html[data-theme="dark"] h3,
                html[data-theme="dark"] h4,
                html[data-theme="dark"] strong {
                    color: #f4f7fb !important;
                }

                html[data-theme="dark"] p,
                html[data-theme="dark"] span,
                html[data-theme="dark"] label {
                    color: #9eabc0;
                }

                html[data-theme="dark"] input,
                html[data-theme="dark"] select,
                html[data-theme="dark"] textarea {
                    background: #172131 !important;
                    color: #f1f5f9 !important;
                    border-color: #334155 !important;
                }

                html[data-theme="dark"] button {
                    color: inherit;
                }

                html[data-theme="dark"] .user-menu {
                    background: #111827 !important;
                    border-color: #263244 !important;
                    box-shadow: 0 20px 50px rgba(0,0,0,.35) !important;
                }

                html[data-theme="dark"] .user-menu-item {
                    color: #dbe5f2 !important;
                }

                html[data-theme="dark"] .user-menu-item:hover {
                    background: #1b2738 !important;
                }

                html[data-theme="dark"] .mobile-topbar {
                    background: #111827 !important;
                    border-color: #263244 !important;
                }

                html[data-theme="dark"] .mobile-bottom-nav {
                    background: #111827 !important;
                    border-color: #263244 !important;
                }

                html[data-theme="dark"] .sidebar-divider {
                    background: #263244 !important;
                }

                html[data-theme="dark"] .toast {
                    background: #f8fafc !important;
                    color: #111827 !important;
                }

                /* ==========================================
                   EXTRA DARK THEME FIXES
                   PROFILE + PROGRESS INNER CARDS
                   ========================================== */

                html[data-theme="dark"] .profile-card {
                    background: #111827 !important;
                    border-color: #263244 !important;
                }

                html[data-theme="dark"] .profile-stats {
                    border-color: #263244 !important;
                }

                html[data-theme="dark"] .profile-stat {
                    border-color: #263244 !important;
                }

                html[data-theme="dark"] .profile-chart-day strong {
                    color: #e8eef8 !important;
                }

                /* Weight progress cards */

                html[data-theme="dark"] .weight-current,
                html[data-theme="dark"] .weight-change {
                    background: #172131 !important;
                    border-color: #334155 !important;
                    color: #e8eef8 !important;
                }

                html[data-theme="dark"] .weight-current strong,
                html[data-theme="dark"] .weight-change strong {
                    color: #f4f7fb !important;
                }

                /* Weight history rows */

                html[data-theme="dark"] .weight-history-row {
                    background: #172131 !important;
                    border-color: #334155 !important;
                    color: #e8eef8 !important;
                }

                html[data-theme="dark"] .weight-history-row strong {
                    color: #f4f7fb !important;
                }

                html[data-theme="dark"] .weight-history-row span {
                    color: #94a3b8 !important;
                }

                /* Personal records */

                html[data-theme="dark"] .record-card {
                    background: #172131 !important;
                    border-color: #334155 !important;
                    color: #e8eef8 !important;
                }

                html[data-theme="dark"] .record-content strong,
                html[data-theme="dark"] .record-result strong {
                    color: #f4f7fb !important;
                }

                html[data-theme="dark"] .record-content span,
                html[data-theme="dark"] .record-result span {
                    color: #94a3b8 !important;
                }

                /* Recent workout items */

                html[data-theme="dark"] .workout-item {
                    background: #172131 !important;
                    border-color: #334155 !important;
                }

                html[data-theme="dark"] .workout-main strong {
                    color: #f4f7fb !important;
                }

                html[data-theme="dark"] .workout-main span {
                    color: #94a3b8 !important;
                }

                html[data-theme="dark"] .meta-pill {
                    background: #1e293b !important;
                    color: #cbd5e1 !important;
                }

                /* Progress empty states */

                html[data-theme="dark"] .empty-state {
                    background: #172131 !important;
                    border-color: #334155 !important;
                }

                html[data-theme="dark"] .empty-state h3 {
                    color: #f4f7fb !important;
                }

                html[data-theme="dark"] .empty-state p {
                    color: #94a3b8 !important;
                }

                /* Progress tracks */

                html[data-theme="dark"] .progress-track {
                    background: #1e293b !important;
                }

                /* Small icons inside cards */

                html[data-theme="dark"] .record-icon {
                    background: #1d355d !important;
                    color: #6ea8ff !important;
                }

                /* ==========================================
                   PROFILE METRIC CARDS — DARK MODE
                   ========================================== */

                html[data-theme="dark"] .profile-metric,
                html[data-theme="dark"] .metric-card,
                html[data-theme="dark"] .profile-overview .stat-card {
                    background: #172131 !important;
                    border-color: #334155 !important;
                    color: #f4f7fb !important;
                }

                html[data-theme="dark"] .profile-metric strong,
                html[data-theme="dark"] .metric-card strong,
                html[data-theme="dark"] .profile-overview .stat-card strong {
                    color: #f4f7fb !important;
                }

                html[data-theme="dark"] .profile-metric span,
                html[data-theme="dark"] .metric-card span,
                html[data-theme="dark"] .profile-overview .stat-card span {
                    color: #94a3b8 !important;
                }

            `;

        } else {

            darkStyle.textContent = "";

        }

    }


    applyTheme();


    // ==========================================
    // WATCH FOR SYSTEM THEME CHANGES
    // ==========================================

    if (
        settings.theme === "system" &&
        window.matchMedia
    ) {

        window
            .matchMedia(
                "(prefers-color-scheme: dark)"
            )
            .addEventListener(
                "change",
                applyTheme
            );

    }


    // ==========================================
    // SETTINGS HELPERS
    // ==========================================

    function getWeightUnit() {

        return settings.weightUnit || "kg";

    }


    function getHeightUnit() {

        return settings.heightUnit || "cm";

    }


    function getStartDay() {

        return settings.startDay || "monday";

    }


    // ==========================================
    // WEIGHT CONVERSION
    // ==========================================

    function kgToLb(kg) {

        return Number(kg) * 2.2046226218;

    }


    function lbToKg(lb) {

        return Number(lb) / 2.2046226218;

    }


    function formatWeight(
        value,
        sourceUnit = "kg"
    ) {

        const number =
            Number(value);


        if (!Number.isFinite(number)) {

            return "—";

        }


        if (
            getWeightUnit() === "lb" &&
            sourceUnit === "kg"
        ) {

            return (
                kgToLb(number)
                    .toFixed(1)
                    .replace(/\.0$/, "")
                + " lb"
            );

        }


        if (
            getWeightUnit() === "kg" &&
            sourceUnit === "lb"
        ) {

            return (
                lbToKg(number)
                    .toFixed(1)
                    .replace(/\.0$/, "")
                + " kg"
            );

        }


        return (
            number
                .toFixed(1)
                .replace(/\.0$/, "")
            + " " +
            getWeightUnit()
        );

    }


    // ==========================================
    // HEIGHT CONVERSION
    // ==========================================

    function cmToFeetInches(cm) {

        const totalInches =
            Number(cm) / 2.54;


        const feet =
            Math.floor(
                totalInches / 12
            );


        const inches =
            Math.round(
                totalInches % 12
            );


        if (inches === 12) {

            return `${feet + 1} ft`;

        }


        return `${feet} ft ${inches} in`;

    }


    function formatHeight(
        value,
        sourceUnit = "cm"
    ) {

        const number =
            Number(value);


        if (!Number.isFinite(number)) {

            return "—";

        }


        if (
            getHeightUnit() === "ft" &&
            sourceUnit === "cm"
        ) {

            return cmToFeetInches(number);

        }


        return (
            number
                .toFixed(1)
                .replace(/\.0$/, "")
            + " cm"
        );

    }


    // ==========================================
    // ICONS
    // ==========================================

    const icons = {

        home: `
            <svg viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor">
                <path d="m3 10 9-7 9 7"/>
                <path d="M5 9v11h14V9"/>
                <path d="M9 20v-6h6v6"/>
            </svg>
        `,

        exercises: `
            <svg viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor">
                <path d="m14.5 6.5 3-3 3 3-3 3"/>
                <path d="m3.5 17.5 3 3 3-3-3-3"/>
                <path d="m8 16 8-8"/>
                <path d="M6 8h3M15 16h3"/>
            </svg>
        `,

        explore: `
            <svg viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor">
                <circle cx="11" cy="11" r="7"/>
                <path d="m20 20-4-4"/>
            </svg>
        `,

        library: `
            <svg viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor">
                <path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/>
                <path d="M5 4a2 2 0 0 0 0 16h14"/>
                <path d="M9 8h6M9 12h6"/>
            </svg>
        `,

        progress: `
            <svg viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor">
                <path d="M4 19V5"/>
                <path d="M4 19h16"/>
                <path d="m7 15 4-5 3 3 5-7"/>
            </svg>
        `,

        profile: `
            <svg viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor">
                <circle cx="12" cy="8" r="3.5"/>
                <path d="M5 20c.8-4 3-6 7-6s6.2 2 7 6"/>
            </svg>
        `,

        notifications: `
            <svg viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor">
                <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
                <path d="M10 21h4"/>
            </svg>
        `,

        more: `
            <svg viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor">
                <circle cx="5" cy="12" r="1"/>
                <circle cx="12" cy="12" r="1"/>
                <circle cx="19" cy="12" r="1"/>
            </svg>
        `,

        settings: `
            <svg viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V20h-2.4v-.21a1.7 1.7 0 0 0-1.03-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 6.46 15a1.7 1.7 0 0 0-1.55-1.03H4.7v-2.4h.21A1.7 1.7 0 0 0 6.46 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06A1.7 1.7 0 0 0 9.94 6.46a1.7 1.7 0 0 0 1.03-1.55V5h2.4v.21a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.88.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 17.54 10a1.7 1.7 0 0 0 1.55 1.03h.21v2.4h-.21A1.7 1.7 0 0 0 17.54 15a1.7 1.7 0 0 0 1.86 0z"/>
            </svg>
        `,

        logout: `
            <svg viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor">
                <path d="M9 5H5v14h4"/>
                <path d="M14 8l4 4-4 4"/>
                <path d="M18 12H9"/>
            </svg>
        `

    };


    // ==========================================
    // SIDEBAR LINKS
    // ==========================================

    const links = [

        ["home", "Home", "dashboard.html"],

        ["exercises", "Exercises", "exercises.html"],

        ["explore", "Explore", "explore.html"],

        ["library", "Library", "library.html"],

        ["progress", "Progress", "progress.html"],

        ["profile", "Profile", "profile.html"],

        ["notifications", "Notifications", "notifications.html"],

        ["more", "More", "more.html"]

    ];


    // ==========================================
    // SIDEBAR
    // ==========================================

    const sidebar =
        document.getElementById(
            "appSidebar"
        );


    if (sidebar) {

        sidebar.innerHTML = `

            <aside class="app-sidebar">

                <a
                    class="app-logo"
                    href="dashboard.html"
                >
                    GYMMAN
                </a>


                <span class="sidebar-section-label">
                    TRAINING
                </span>


                <nav class="app-nav">

                    ${links.map(
                        ([key, label, href]) => `

                        <a
                            href="${href}"
                            class="${page === key ? "active" : ""}"
                        >

                            ${icons[key]}

                            <span>
                                ${label}
                            </span>

                        </a>

                    `).join("")}

                </nav>


                <div class="sidebar-divider"></div>


                <span class="sidebar-section-label">
                    TOOLS
                </span>


                <nav class="app-nav">

                    <a
                        href="bmi.html"
                        class="${page === "bmi" ? "active" : ""}"
                    >
                        ${icons.progress}
                        <span>BMI</span>
                    </a>


                    <a
                        href="calories.html"
                        class="${page === "calories" ? "active" : ""}"
                    >
                        ${icons.progress}
                        <span>Calories</span>
                    </a>


                    <a
                        href="diet.html"
                        class="${page === "diet" ? "active" : ""}"
                    >
                        ${icons.library}
                        <span>Diet Planner</span>
                    </a>

                </nav>


                <div class="sidebar-bottom">

                    <button
                        class="user-mini user-menu-trigger"
                        id="userMenuTrigger"
                        type="button"
                        aria-expanded="false"
                        aria-controls="userMenu"
                    >

                        <div
                            class="avatar"
                            data-user-initial
                        >
                            ${username
                                .charAt(0)
                                .toUpperCase()}
                        </div>


                        <div class="user-mini-info">

                            <strong
                                data-current-username
                            >
                                ${username}
                            </strong>

                            <span>
                                Member
                            </span>

                        </div>


                        <svg
                            class="user-menu-chevron"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                        >
                            <path d="m6 9 6 6 6-6"/>
                        </svg>

                    </button>


                    <div
                        class="user-menu"
                        id="userMenu"
                        hidden
                    >

                        <div class="user-menu-header">

                            <div class="user-menu-avatar">
                                ${username
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>


                            <div>

                                <strong>
                                    ${username}
                                </strong>

                                <span>
                                    Gymman Member
                                </span>

                            </div>

                        </div>


                        <div class="user-menu-divider"></div>


                        <a
                            href="profile.html"
                            class="user-menu-item"
                        >
                            ${icons.profile}
                            <span>Profile</span>
                        </a>


                        <a
                            href="settings.html"
                            class="user-menu-item"
                        >
                            ${icons.settings}
                            <span>Settings</span>
                        </a>


                        <div class="user-menu-divider"></div>


                        <button
                            type="button"
                            class="user-menu-item user-menu-logout"
                            id="logout"
                        >
                            ${icons.logout}
                            <span>Log out</span>
                        </button>

                    </div>

                </div>

            </aside>

        `;

    }


    // ==========================================
    // MOBILE TOP BAR
    // ==========================================

    const mobile =
        document.createElement("div");


    mobile.className =
        "mobile-topbar";


    mobile.innerHTML = `

        <a
            class="logo"
            href="dashboard.html"
        >
            GYMMAN
        </a>


        <button
            type="button"
            class="mobile-user"
            id="mobileUserButton"
            aria-label="Open profile menu"
        >
            ${username
                .charAt(0)
                .toUpperCase()}
        </button>

    `;


    document.body.prepend(
        mobile
    );


    // ==========================================
    // MOBILE BOTTOM NAVIGATION
    // ==========================================

    const bottom =
        document.createElement("nav");


    bottom.className =
        "mobile-bottom-nav";


    const mobileLinks = [

        ["home", "Home", "dashboard.html"],

        ["exercises", "Exercises", "exercises.html"],

        ["library", "Library", "library.html"],

        ["progress", "Progress", "progress.html"],

        ["profile", "Profile", "profile.html"]

    ];


    bottom.innerHTML =
        mobileLinks
            .map(
                ([key, label, href]) => `

                    <a
                        href="${href}"
                        class="${page === key ? "active" : ""}"
                    >

                        ${icons[key]}

                        <span>
                            ${label}
                        </span>

                    </a>

                `
            )
            .join("");


    document.body.appendChild(
        bottom
    );


    // ==========================================
    // PROFILE MENU
    // ==========================================

    const userMenuTrigger =
        document.getElementById(
            "userMenuTrigger"
        );


    const userMenu =
        document.getElementById(
            "userMenu"
        );


    function openUserMenu() {

        if (
            !userMenu ||
            !userMenuTrigger
        ) {
            return;
        }


        userMenu.hidden =
            false;


        userMenuTrigger.setAttribute(
            "aria-expanded",
            "true"
        );


        userMenuTrigger.classList.add(
            "menu-open"
        );

    }


    function closeUserMenu() {

        if (
            !userMenu ||
            !userMenuTrigger
        ) {
            return;
        }


        userMenu.hidden =
            true;


        userMenuTrigger.setAttribute(
            "aria-expanded",
            "false"
        );


        userMenuTrigger.classList.remove(
            "menu-open"
        );

    }


    function toggleUserMenu() {

        if (!userMenu) {
            return;
        }


        if (userMenu.hidden) {

            openUserMenu();

        } else {

            closeUserMenu();

        }

    }


    if (userMenuTrigger) {

        userMenuTrigger.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleUserMenu();

            }
        );

    }


    // ==========================================
    // MOBILE USER BUTTON
    // ==========================================

    const mobileUserButton =
    document.getElementById(
        "mobileUserButton"
    );

const mobileUserMenu =
    document.createElement("div");

mobileUserMenu.className =
    "mobile-user-menu";

mobileUserMenu.id =
    "mobileUserMenu";

mobileUserMenu.hidden = true;

mobileUserMenu.innerHTML = `

    <div class="mobile-user-menu-header">

        <div class="mobile-user-menu-avatar">
            ${username
                .charAt(0)
                .toUpperCase()}
        </div>

        <div class="mobile-user-menu-info">

            <strong>
                ${username}
            </strong>

            <span>
                Gymman Member
            </span>

        </div>

    </div>

    <div class="mobile-user-menu-divider"></div>

    <a
        href="profile.html"
        class="mobile-user-menu-item"
    >
        ${icons.profile}
        <span>Profile</span>
    </a>

    <a
        href="settings.html"
        class="mobile-user-menu-item"
    >
        ${icons.settings}
        <span>Settings</span>
    </a>

    <div class="mobile-user-menu-divider"></div>

    <button
        type="button"
        class="mobile-user-menu-item mobile-user-menu-logout"
        id="mobileLogout"
    >
        ${icons.logout}
        <span>Log out</span>
    </button>

`;

if (mobileUserButton) {

    mobileUserButton.parentElement.appendChild(
        mobileUserMenu
    );

    mobileUserButton.setAttribute(
        "aria-expanded",
        "false"
    );

    mobileUserButton.setAttribute(
        "aria-controls",
        "mobileUserMenu"
    );


    mobileUserButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            const isOpen =
                !mobileUserMenu.hidden;

            mobileUserMenu.hidden =
                isOpen;

            mobileUserButton.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

        }
    );


    mobileUserMenu.addEventListener(
        "click",
        event => {

            event.stopPropagation();

        }
    );


    document.addEventListener(
        "click",
        () => {

            if (!mobileUserMenu.hidden) {

                mobileUserMenu.hidden =
                    true;

                mobileUserButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !mobileUserMenu.hidden
            ) {

                mobileUserMenu.hidden =
                    true;

                mobileUserButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );


    const mobileLogout =
        document.getElementById(
            "mobileLogout"
        );


    if (mobileLogout) {

        mobileLogout.addEventListener(
            "click",
            event => {

                event.preventDefault();

                localStorage.removeItem(
                    "currentUser"
                );

                sessionStorage.removeItem(
                    "accessToken"
                );


                try {

                    const keys = [];

                    for (
                        let i = 0;
                        i < sessionStorage.length;
                        i++
                    ) {

                        const key =
                            sessionStorage.key(i);

                        if (
                            key &&
                            key.startsWith(
                                "gymman_cache_"
                            )
                        ) {

                            keys.push(key);

                        }

                    }

                    keys.forEach(
                        key =>
                            sessionStorage.removeItem(
                                key
                            )
                    );

                } catch (error) {

                    console.warn(
                        "GYMMAN logout cache cleanup error:",
                        error
                    );

                }


                window.location.href =
                    "login.html";

            }
        );

    }

}


    // ==========================================
    // CLOSE MENU OUTSIDE
    // ==========================================

    document.addEventListener(
        "click",
        event => {

            if (
                userMenu &&
                userMenuTrigger &&
                !userMenu.contains(
                    event.target
                ) &&
                !userMenuTrigger.contains(
                    event.target
                )
            ) {

                closeUserMenu();

            }

        }
    );


    // ==========================================
    // ESCAPE KEY
    // ==========================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeUserMenu();

            }

        }
    );


    // ==========================================
    // LOGOUT
    // ==========================================

    document.addEventListener(
        "click",
        event => {

            const logout =
                event.target.closest(
                    "#logout"
                );


            if (!logout) {
                return;
            }


            localStorage.removeItem(
                "currentUser"
            );

            sessionStorage.removeItem(
                "accessToken"
            );


            // Clear GYMMAN API cache when logging out
            try {

                const keys = [];

                for (
                    let i = 0;
                    i < sessionStorage.length;
                    i++
                ) {

                    const key =
                        sessionStorage.key(i);

                    if (
                        key &&
                        key.startsWith(
                            "gymman_cache_"
                        )
                    ) {

                        keys.push(key);

                    }

                }


                keys.forEach(
                    key =>
                        sessionStorage.removeItem(
                            key
                        )
                );

            } catch (error) {

                console.warn(
                    "GYMMAN logout cache cleanup error:",
                    error
                );

            }


            window.location.href =
                "login.html";

        }
    );


    // ==========================================
    // GYMMAN GLOBAL OBJECT
    // ==========================================

    window.LIFT = {

        // Logged-in username
        username,


        // ======================================
        // API
        // ======================================

        api:
            apiBase,

        authReady,

        request:
            authenticatedFetch,


        // Current settings
        settings,


        // ======================================
        // INTERNAL REQUEST STATE
        // ======================================

        _pendingGets:
            Object.create(null),


        // ======================================
        // SETTINGS HELPERS
        // ======================================

        getSettings() {

            return getSettings();

        },


        getWeightUnit() {

            return getWeightUnit();

        },


        getHeightUnit() {

            return getHeightUnit();

        },


        getStartDay() {

            return getStartDay();

        },


        formatWeight(
            value,
            sourceUnit = "kg"
        ) {

            return formatWeight(
                value,
                sourceUnit
            );

        },


        formatHeight(
            value,
            sourceUnit = "cm"
        ) {

            return formatHeight(
                value,
                sourceUnit
            );

        },


        kgToLb(kg) {

            return kgToLb(kg);

        },


        lbToKg(lb) {

            return lbToKg(lb);

        },


        // ======================================
        // API GET
        // ======================================

        async get(path) {

            const cacheKey =
                `gymman_cache_${path}`;

            const CACHE_TIME =
                30000;


            // --------------------------------------
            // SHARE EXISTING REQUEST
            // --------------------------------------

            if (
                this._pendingGets &&
                this._pendingGets[cacheKey]
            ) {

                return this._pendingGets[
                    cacheKey
                ];

            }


            // --------------------------------------
            // READ CACHE
            // --------------------------------------

            try {

                const cached =
                    sessionStorage.getItem(
                        cacheKey
                    );


                if (cached) {

                    const parsed =
                        JSON.parse(
                            cached
                        );


                    if (
                        parsed &&
                        parsed.data !== undefined &&
                        Date.now() -
                            Number(
                                parsed.time || 0
                            ) <
                            CACHE_TIME
                    ) {

                        /*
                         * Cached data is returned immediately.
                         *
                         * The fresh request happens silently
                         * in the background.
                         */

                        this._refreshGet(
                            path,
                            cacheKey
                        );


                        return parsed.data;

                    }

                }

            } catch (error) {

                console.warn(
                    "GYMMAN cache read error:",
                    error
                );

            }


            // --------------------------------------
            // NO CACHE → FETCH ONCE
            // --------------------------------------

            const request =
                (async () => {

                    const response =
                        await authenticatedFetch(
                            path,
                            {
                                cache:
                                    "no-store"
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Request failed."
                        );

                    }


                    this._saveCache(
                        cacheKey,
                        data
                    );


                    return data;

                })();


            if (!this._pendingGets) {

                this._pendingGets =
                    Object.create(null);

            }


            this._pendingGets[
                cacheKey
            ] = request;


            try {

                return await request;

            } finally {

                delete this._pendingGets[
                    cacheKey
                ];

            }

        },


        // ======================================
        // BACKGROUND GET REFRESH
        // ======================================

        _refreshGet(
            path,
            cacheKey
        ) {

            if (!this._pendingGets) {

                this._pendingGets =
                    Object.create(null);

            }


            if (
                this._pendingGets[
                    cacheKey
                ]
            ) {

                return this._pendingGets[
                    cacheKey
                ];

            }


            const request =
                authenticatedFetch(
                    path,
                    {
                        cache:
                            "no-store"
                    }
                )
                    .then(
                        async response => {

                            const data =
                                await response.json();


                            if (!response.ok) {

                                throw new Error(
                                    data.message ||
                                    "Request failed."
                                );

                            }


                            this._saveCache(
                                cacheKey,
                                data
                            );


                            return data;

                        }
                    )
                    .catch(
                        error => {

                            /*
                             * Background refresh failures
                             * should never interrupt the
                             * already-visible cached page.
                             */

                            console.warn(
                                "GYMMAN background refresh failed:",
                                error
                            );


                            return null;

                        }
                    );


            this._pendingGets[
                cacheKey
            ] = request;


            request.finally(
                () => {

                    delete this._pendingGets[
                        cacheKey
                    ];

                }
            );


            return request;

        },


        // ======================================
        // SAVE CACHE
        // ======================================

        _saveCache(
            cacheKey,
            data
        ) {

            try {

                sessionStorage.setItem(
                    cacheKey,
                    JSON.stringify({
                        time:
                            Date.now(),

                        data:
                            data
                    })
                );

            } catch (error) {

                console.warn(
                    "GYMMAN cache write error:",
                    error
                );

            }

        },


        // ======================================
        // CLEAR API CACHE
        // ======================================

        clearCache() {

            try {

                const keys = [];


                for (
                    let i = 0;
                    i < sessionStorage.length;
                    i++
                ) {

                    const key =
                        sessionStorage.key(
                            i
                        );


                    if (
                        key &&
                        key.startsWith(
                            "gymman_cache_"
                        )
                    ) {

                        keys.push(key);

                    }

                }


                keys.forEach(
                    key =>
                        sessionStorage.removeItem(
                            key
                        )
                );


            } catch (error) {

                console.warn(
                    "GYMMAN cache clear error:",
                    error
                );

            }

        },


        // ======================================
        // API POST
        // ======================================

        async post(
            path,
            body
        ) {

            const response =
                await authenticatedFetch(
                    path,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                body
                            )
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Request failed."
                );

            }


            /*
             * POST operations can change:
             *
             * - dashboard
             * - progress
             * - workout history
             * - personal records
             * - calories
             * - activity
             *
             * Therefore clear cached GET responses.
             */

            this.clearCache();


            return data;

        },


        // ======================================
        // API DELETE
        // ======================================

        async del(
            path
        ) {

            const response =
                await authenticatedFetch(
                    path,
                    {
                        method:
                            "DELETE"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Request failed."
                );

            }


            this.clearCache();


            return data;

        },


        // ======================================
        // TOAST
        // ======================================

        toast(message) {

            let toast =
                document.querySelector(
                    ".toast"
                );


            if (!toast) {

                toast =
                    document.createElement(
                        "div"
                    );


                toast.className =
                    "toast";


                document.body.appendChild(
                    toast
                );

            }


            toast.textContent =
                message;


            toast.classList.add(
                "show"
            );


            clearTimeout(
                toast._timer
            );


            toast._timer =
                setTimeout(
                    () => {

                        toast.classList.remove(
                            "show"
                        );

                    },
                    2400
                );

        },


        // ======================================
        // ESCAPE HTML
        // ======================================

        escape(value) {

            return String(
                value ?? ""
            ).replace(
                /[&<>'"]/g,
                char => ({
                    "&":
                        "&amp;",

                    "<":
                        "&lt;",

                    ">":
                        "&gt;",

                    "'":
                        "&#39;",

                    '"':
                        "&quot;"

                }[char])
            );

        }

    };


    // ==========================================
    // UPDATE GYMMAN OBJECT WHEN SETTINGS CHANGE
    // ==========================================

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key !==
                "liftSettings"
            ) {

                return;

            }


            const newSettings =
                getSettings();


            Object.assign(
                window.LIFT.settings,
                newSettings
            );


            Object.assign(
                settings,
                newSettings
            );


            applyTheme();

        }
    );


})();