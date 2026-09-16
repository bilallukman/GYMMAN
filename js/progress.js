(async function () {

    try {

        // ==========================================
        // LOAD USER
        // ==========================================

        const data = await window.LIFT.get(
            `/user/${encodeURIComponent(window.LIFT.username)}`
        );

        const u = data.user;


        // ==========================================
        // UNIT HELPERS
        // ==========================================

        function getWeightUnit() {

            if (
                window.LIFT &&
                typeof window.LIFT.getWeightUnit === "function"
            ) {
                return window.LIFT.getWeightUnit();
            }

            return "kg";
        }


        function kgToLb(kg) {

            if (
                window.LIFT &&
                typeof window.LIFT.kgToLb === "function"
            ) {
                return window.LIFT.kgToLb(kg);
            }

            return Number(kg) * 2.2046226218;
        }


        function formatWeight(kg) {

            const value = Number(kg) || 0;

            if (getWeightUnit() === "lb") {

                return (
                    kgToLb(value)
                        .toFixed(1)
                        .replace(/\.0$/, "") +
                    " lb"
                );
            }

            return (
                value
                    .toFixed(1)
                    .replace(/\.0$/, "") +
                " kg"
            );
        }


        // ==========================================
        // BASIC STATS
        // ==========================================

        document.getElementById("pWorkouts").textContent =
            u.workoutCount || 0;


        document.getElementById("pStreak").textContent =
            u.streak || 0;


        document.getElementById("pCalories").textContent =
            u.calories || 0;


        document.getElementById("pBmi").textContent =
            u.bmi ?? "--";


        // ==========================================
        // LOAD WORKOUTS
        // ==========================================

        const workoutData =
            await window.LIFT.get(
                `/workouts/${encodeURIComponent(
                    window.LIFT.username
                )}`
            );


        const workouts =
            workoutData.workouts || [];


        // ==========================================
        // TOTAL SETS / REPS / VOLUME
        // ==========================================

        let totalSets = 0;

        let totalReps = 0;

        let totalVolume = 0;


        workouts.forEach(workout => {

            const sets =
                Number(workout.sets) || 0;


            const reps =
                Number(workout.reps) || 0;


            // Database value is always KG
            const weight =
                Number(workout.weight) || 0;


            totalSets += sets;


            totalReps +=
                sets * reps;


            totalVolume +=
                weight * sets * reps;

        });


        document.getElementById("pSets").textContent =
            totalSets;


        document.getElementById("pReps").textContent =
            totalReps;


        document.getElementById("pVolumeTotal").textContent =
            formatWeight(totalVolume);


        // ==========================================
        // MUSCLE DATA
        // ==========================================

        const muscles = [

            "Chest",
            "Back",
            "Shoulders",
            "Legs",
            "Arms",
            "Core",
            "Cardio"

        ];


        const muscleSets = {};

        const muscleVolume = {};


        muscles.forEach(muscle => {

            muscleSets[muscle] = 0;

            muscleVolume[muscle] = 0;

        });


        workouts.forEach(workout => {

            const muscle =
                workout.muscle;


            const sets =
                Number(workout.sets) || 0;


            const reps =
                Number(workout.reps) || 0;


            const weight =
                Number(workout.weight) || 0;


            if (!(muscle in muscleSets)) {

                muscleSets[muscle] = 0;

                muscleVolume[muscle] = 0;

            }


            muscleSets[muscle] +=
                sets;


            muscleVolume[muscle] +=
                weight * sets * reps;

        });


        // ==========================================
        // TOP MUSCLE
        // ==========================================

        let topMuscle = "--";

        let highestSets = 0;


        Object.entries(muscleSets).forEach(
            ([muscle, sets]) => {

                if (sets > highestSets) {

                    highestSets =
                        sets;

                    topMuscle =
                        muscle;

                }

            }
        );


        document.getElementById(
            "pTopMuscle"
        ).textContent =
            topMuscle;


        // ==========================================
        // MUSCLE DISTRIBUTION
        // ==========================================

        const muscleEntries =
            muscles.map(
                muscle => [
                    muscle,
                    muscleSets[muscle] || 0
                ]
            );


        const maxMuscle =
            Math.max(
                1,
                ...muscleEntries.map(
                    item => item[1]
                )
            );


        document.getElementById(
            "pMuscles"
        ).innerHTML =

            muscleEntries.map(
                ([name, value]) => {

                    const percentage =
                        Math.min(
                            100,
                            (
                                value /
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
                                ${value}
                            </span>

                        </div>

                    `;

                }
            ).join("");


        // ==========================================
        // PERSONAL RECORDS
        // ==========================================

        const records = {};


        workouts.forEach(workout => {

            const exercise =
                workout.exercise;


            // Database value is KG
            const weight =
                Number(workout.weight) || 0;


            const reps =
                Number(workout.reps) || 0;


            const sets =
                Number(workout.sets) || 0;


            if (!records[exercise]) {

                records[exercise] = {

                    exercise,

                    muscle:
                        workout.muscle,

                    weight: 0,

                    reps: 0,

                    sets: 0

                };

            }


            // Highest weight is the primary PR

            if (
                weight >
                records[exercise].weight
            ) {

                records[exercise].weight =
                    weight;

                records[exercise].reps =
                    reps;

                records[exercise].sets =
                    sets;

            }


            // If weight is equal,
            // keep the higher reps

            else if (
                weight ===
                records[exercise].weight &&

                reps >
                records[exercise].reps
            ) {

                records[exercise].reps =
                    reps;

                records[exercise].sets =
                    sets;

            }

        });


        const recordList =
            Object.values(records)
                .sort(
                    (a, b) =>
                        b.weight -
                        a.weight
                );


        const recordsContainer =
            document.getElementById(
                "personalRecords"
            );


        if (!recordList.length) {

            recordsContainer.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No personal records yet
                    </h3>

                    <p>
                        Log a weighted workout to start building your records.
                    </p>

                </div>

            `;

        } else {

            recordsContainer.innerHTML =

                recordList.map(record => `

                    <article class="record-card">

                        <div class="record-icon">
                            PR
                        </div>


                        <div class="record-content">

                            <strong>
                                ${escapeHtml(
                                    record.exercise
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    record.muscle
                                )}
                            </span>

                        </div>


                        <div class="record-result">

                            <strong>
                                ${formatWeight(
                                    record.weight
                                )}
                            </strong>

                            <span>
                                ${record.sets}
                                ×
                                ${record.reps}
                            </span>

                        </div>

                    </article>

                `).join("");

        }


        // ==========================================
        // TRAINING VOLUME BY MUSCLE
        // ==========================================

        const volumeEntries =
            muscles.map(
                muscle => [
                    muscle,
                    muscleVolume[muscle] || 0
                ]
            );


        const maxVolume =
            Math.max(
                1,
                ...volumeEntries.map(
                    item => item[1]
                )
            );


        document.getElementById(
            "pVolume"
        ).innerHTML =

            volumeEntries.map(
                ([name, value]) => {

                    const percentage =
                        Math.min(
                            100,
                            (
                                value /
                                maxVolume
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
                                ${formatWeight(value)}
                            </span>

                        </div>

                    `;

                }
            ).join("");


        // ==========================================
        // LAST 7 DAYS
        // ==========================================

        const values =
            u.weeklyActivity || [];


        const maxDay =
            Math.max(
                1,
                ...values.map(
                    x => x.count
                )
            );


        const labels = [];


        for (
            let i = 6;
            i >= 0;
            i--
        ) {

            const date =
                new Date();


            date.setDate(
                date.getDate() - i
            );


            labels.push(
                date
                    .toLocaleDateString(
                        undefined,
                        {
                            weekday: "short"
                        }
                    )
                    .slice(0, 2)
            );

        }


        document.getElementById(
            "pWeek"
        ).innerHTML =

            values.map(
                (item, index) => {

                    const height =
                        Math.max(
                            item.count
                                ? (
                                    item.count /
                                    maxDay
                                ) * 100
                                : 4,
                            4
                        );


                    return `

                        <div
                            class="week-day
                            ${
                                index === 6
                                    ? "today"
                                    : ""
                            }"
                        >

                            <div class="week-bar-wrap">

                                <div
                                    class="week-bar"
                                    style="height:${height}%"
                                ></div>

                            </div>

                            <strong>
                                ${item.count}
                            </strong>

                            <span>
                                ${labels[index]}
                            </span>

                        </div>

                    `;

                }
            ).join("");


    } catch (error) {

        console.error(
            "Progress error:",
            error
        );


        window.LIFT.toast(
            "Unable to load progress."
        );

    }


    // ==========================================
    // HELPERS
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