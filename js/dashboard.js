// ==========================================
// GYMMAN DASHBOARD
// ==========================================

(async function () {

    // ==========================================
    // CHECK USER
    // ==========================================

    const username =
        window.LIFT?.username;

    if (!username) {
        return;
    }


    // ==========================================
    // HELPERS
    // ==========================================

    const setText = (
        id,
        value
    ) => {

        const el =
            document.getElementById(id);

        if (el) {
            el.textContent =
                value;
        }

    };


    const formatDate = value => {

        if (!value) {
            return "";
        }


        const date =
            new Date(
                value.replace(
                    " ",
                    "T"
                ) +
                (
                    value.endsWith("Z")
                        ? ""
                        : "Z"
                )
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return value;

        }


        return date.toLocaleDateString(
            undefined,
            {
                month: "short",
                day: "numeric"
            }
        );

    };


    // ==========================================
    // SHOW DASHBOARD DATA
    // ==========================================

    function renderDashboard(data) {

        if (!data || !data.user) {
            return;
        }


        const user =
            data.user;


        // --------------------------------------
        // BASIC STATS
        // --------------------------------------

        setText(
            "welcomeTitle",
            `Good to see you, ${user.username}.`
        );


        setText(
            "workoutCount",
            user.workoutCount || 0
        );


        setText(
            "bmiValue",
            user.bmi ?? "--"
        );


        setText(
            "caloriesValue",
            user.calories || 0
        );


        setText(
            "streakValue",
            user.streak || 0
        );


        // --------------------------------------
        // LATEST TRAINING
        // --------------------------------------

        const latest =
            user.recentWorkouts?.[0];


        const latestBox =
            document.getElementById(
                "latestTraining"
            );


        if (
            latest &&
            latestBox
        ) {

            latestBox.innerHTML = `

                <div>

                    <strong>
                        ${window.LIFT.escape(
                            latest.exercise
                        )}
                    </strong>

                    <span>
                        ${window.LIFT.escape(
                            latest.muscle
                        )}
                        ·
                        ${latest.sets}
                        sets ×
                        ${latest.reps}
                        reps ·
                        ${formatDate(
                            latest.created_at
                        )}
                    </span>

                </div>

                <span class="training-badge">
                    RECENT
                </span>

            `;

        }


        // --------------------------------------
        // RECENT ACTIVITY
        // --------------------------------------

        const recent =
            document.getElementById(
                "recentActivity"
            );


        if (recent) {

            if (
                !user.recentWorkouts?.length
            ) {

                recent.innerHTML = `

                    <div class="empty-state">

                        <h3>
                            No training yet
                        </h3>

                        <p>
                            Add your first exercise
                            and your activity will
                            appear here.
                        </p>

                        <a
                            class="btn btn-primary"
                            href="workout.html"
                        >
                            Add workout
                        </a>

                    </div>

                `;

            } else {

                recent.innerHTML =
                    user.recentWorkouts
                        .map(item => `

                            <div class="activity-row">

                                <div class="activity-dot">
                                    ${window.LIFT
                                        .escape(
                                            item.muscle
                                        )
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </div>

                                <div>

                                    <strong>
                                        ${window.LIFT
                                            .escape(
                                                item.exercise
                                            )}
                                    </strong>

                                    <span>
                                        ${window.LIFT
                                            .escape(
                                                item.muscle
                                            )}
                                        ·
                                        ${item.sets}
                                        ×
                                        ${item.reps}
                                    </span>

                                </div>

                                <time>
                                    ${formatDate(
                                        item.created_at
                                    )}
                                </time>

                            </div>

                        `)
                        .join("");

            }

        }


        // --------------------------------------
        // WEEKLY ACTIVITY
        // --------------------------------------

        const chart =
            document.getElementById(
                "weekChart"
            );


        if (chart) {

            const values =
                user.weeklyActivity || [];


            const max =
                Math.max(
                    1,
                    ...values.map(
                        item =>
                            Number(
                                item.count || 0
                            )
                    )
                );


            const labels = [];


            for (
                let i = 6;
                i >= 0;
                i--
            ) {

                const d =
                    new Date();


                d.setDate(
                    d.getDate() - i
                );


                labels.push(
                    d.toLocaleDateString(
                        undefined,
                        {
                            weekday: "short"
                        }
                    ).slice(0, 2)
                );

            }


            chart.innerHTML =
                values.map(
                    (item, index) => {

                        const count =
                            Number(
                                item.count || 0
                            );


                        const height =
                            count
                                ? (
                                    count /
                                    max
                                ) * 100
                                : 4;


                        return `

                            <div
                                class="week-day ${
                                    index === 6
                                        ? "today"
                                        : ""
                                }"
                            >

                                <div class="week-bar-wrap">

                                    <div
                                        class="week-bar"
                                        style="
                                            height:${Math.max(
                                                height,
                                                4
                                            )}%
                                        "
                                    ></div>

                                </div>

                                <strong>
                                    ${count}
                                </strong>

                                <span>
                                    ${labels[index] || ""}
                                </span>

                            </div>

                        `;

                    }
                ).join("");

        }


        // --------------------------------------
        // MUSCLE PROGRESS
        // --------------------------------------

        const progress =
            user.progress || {};


        const muscleProgress =
            document.getElementById(
                "muscleProgress"
            );


        if (muscleProgress) {

            const entries = [

                [
                    "Chest",
                    progress.chest
                ],

                [
                    "Back",
                    progress.back
                ],

                [
                    "Shoulders",
                    progress.shoulders
                ],

                [
                    "Legs",
                    progress.legs
                ],

                [
                    "Arms",
                    progress.arms
                ]

            ];


            const max =
                Math.max(
                    1,
                    ...entries.map(
                        ([, value]) =>
                            Number(
                                value || 0
                            )
                    )
                );


            muscleProgress.innerHTML =
                entries.map(
                    ([name, value]) => {

                        const number =
                            Number(
                                value || 0
                            );


                        const width =
                            Math.min(
                                100,
                                (
                                    number /
                                    max
                                ) * 100
                            );


                        return `

                            <div class="progress-row">

                                <label>
                                    ${name}
                                </label>

                                <div class="progress-track">

                                    <div
                                        class="progress-fill"
                                        style="
                                            width:${width}%
                                        "
                                    ></div>

                                </div>

                                <span>
                                    ${number}
                                </span>

                            </div>

                        `;

                    }
                ).join("");

        }

    }


    // ==========================================
    // LOAD DASHBOARD
    // ==========================================

    try {

        /*
         * window.LIFT.get() now handles:
         *
         * 1. Cached data → instant display
         * 2. Fresh request → normal load
         * 3. Background refresh → silent update
         *
         * We only render after valid data exists.
         */

        const data =
            await window.LIFT.get(
                `/user/${encodeURIComponent(
                    username
                )}`
            );


        renderDashboard(
            data
        );


    } catch (error) {

        console.error(
            "GYMMAN dashboard error:",
            error
        );


        window.LIFT.toast(
            "Unable to load your fitness data."
        );

    }

})();