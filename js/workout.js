(function () {

    const username = window.LIFT?.username;

    if (!username) return;


    /* --------------------------------
       FORM ELEMENTS
    -------------------------------- */

    const exerciseInput =
        document.getElementById("exercise");

    const muscleInput =
        document.getElementById("muscle");

    const weightInput =
        document.getElementById("weight");

    const setsInput =
        document.getElementById("sets");

    const repsInput =
        document.getElementById("reps");

    const addButton =
        document.getElementById("addWorkout");

    const workoutList =
        document.getElementById("workoutList");

    const summary =
        document.getElementById("workoutSummary");


    /* --------------------------------
       UNIT SETTINGS
    -------------------------------- */

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


    function lbToKg(lb) {

        if (
            window.LIFT &&
            typeof window.LIFT.lbToKg === "function"
        ) {
            return window.LIFT.lbToKg(lb);
        }

        return Number(lb) / 2.2046226218;
    }


    function formatWeight(kg) {

        if (!Number.isFinite(Number(kg))) {
            return "—";
        }

        const value = Number(kg);


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


    function getWeightLabel() {

        return getWeightUnit() === "lb"
            ? "lb"
            : "kg";
    }


    /* --------------------------------
       UPDATE WEIGHT UI
    -------------------------------- */

    function updateWeightUI() {

        const unit =
            getWeightLabel();


        const weightWrapper =
            weightInput?.closest(
                ".weight-input-wrapper"
            );


        if (weightWrapper) {

            const unitElement =
                weightWrapper.querySelector("span");


            if (unitElement) {

                unitElement.textContent =
                    unit;

            }

        }


        const weightLabel =
            document.querySelector(
                'label[for="weight"]'
            );


        if (weightLabel) {

            weightLabel.textContent =
                "Weight";

        }


        if (weightInput) {

            weightInput.placeholder =
                unit === "lb"
                    ? "e.g. 88"
                    : "e.g. 40";

        }

    }


    /* --------------------------------
       PLAN ELEMENTS
    -------------------------------- */

    const planPreview =
        document.getElementById("planPreview");

    const selectedPlanTitle =
        document.getElementById("selectedPlanTitle");

    const selectedPlanDescription =
        document.getElementById(
            "selectedPlanDescription"
        );

    const planExercises =
        document.getElementById(
            "planExercises"
        );


    /* --------------------------------
       TRAINING PLANS
    -------------------------------- */

    const trainingPlans = {

        "Full Body Starter": {

            description:
                "A balanced full-body workout for building a strong training foundation.",

            exercises: [
                ["Barbell Squat", "Legs"],
                ["Bench Press", "Chest"],
                ["Lat Pulldown", "Back"],
                ["Shoulder Press", "Shoulders"],
                ["Bicep Curl", "Arms"],
                ["Tricep Pushdown", "Arms"],
                ["Cable Crunch", "Core"]
            ]

        },


        "Upper Body Strength": {

            description:
                "Build your upper body with focused chest, back, shoulder and arm exercises.",

            exercises: [
                ["Bench Press", "Chest"],
                ["Incline Dumbbell Press", "Chest"],
                ["Lat Pulldown", "Back"],
                ["Seated Cable Row", "Back"],
                ["Shoulder Press", "Shoulders"],
                ["Lateral Raise", "Shoulders"],
                ["Bicep Curl", "Arms"],
                ["Tricep Pushdown", "Arms"]
            ]

        },


        "Lower Body Focus": {

            description:
                "A lower-body focused session for building strength and stability.",

            exercises: [
                ["Barbell Squat", "Legs"],
                ["Leg Press", "Legs"],
                ["Romanian Deadlift", "Legs"],
                ["Leg Curl", "Legs"],
                ["Calf Raise", "Legs"]
            ]

        },


        "Push Day": {

            description:
                "Train your chest, shoulders and triceps in one focused push session.",

            exercises: [
                ["Bench Press", "Chest"],
                ["Incline Dumbbell Press", "Chest"],
                ["Shoulder Press", "Shoulders"],
                ["Lateral Raise", "Shoulders"],
                ["Tricep Pushdown", "Arms"]
            ]

        },


        "Pull Day": {

            description:
                "Build your back and biceps with a structured pulling workout.",

            exercises: [
                ["Lat Pulldown", "Back"],
                ["Seated Cable Row", "Back"],
                ["Face Pull", "Back"],
                ["Bicep Curl", "Arms"],
                ["Hammer Curl", "Arms"]
            ]

        },


        "Cardio Base": {

            description:
                "Build a simple and repeatable cardio routine.",

            exercises: [
                ["Treadmill Walk", "Cardio"],
                ["Running", "Cardio"],
                ["Cycling", "Cardio"]
            ]

        }

    };


    /* --------------------------------
       CUSTOM PROGRAM SUPPORT
    -------------------------------- */

    function getCustomProgramId() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        return params.get("customProgram");

    }


    function getExerciseMuscle(exerciseName) {

        const muscleMap = {

            "Bench Press": "Chest",
            "Incline Dumbbell Press": "Chest",
            "Dumbbell Bench Press": "Chest",
            "Incline Barbell Press": "Chest",
            "Chest Fly": "Chest",
            "Cable Crossover": "Chest",
            "Push Ups": "Chest",
            "Decline Bench Press": "Chest",

            "Lat Pulldown": "Back",
            "Seated Cable Row": "Back",
            "Barbell Row": "Back",
            "One Arm Dumbbell Row": "Back",
            "Pull Ups": "Back",
            "Assisted Pull Up": "Back",
            "Straight Arm Pulldown": "Back",
            "T Bar Row": "Back",

            "Shoulder Press": "Shoulders",
            "Dumbbell Shoulder Press": "Shoulders",
            "Lateral Raise": "Shoulders",
            "Front Raise": "Shoulders",
            "Rear Delt Fly": "Shoulders",
            "Face Pull": "Shoulders",
            "Arnold Press": "Shoulders",
            "Upright Row": "Shoulders",

            "Barbell Squat": "Legs",
            "Leg Press": "Legs",
            "Romanian Deadlift": "Legs",
            "Leg Extension": "Legs",
            "Leg Curl": "Legs",
            "Walking Lunges": "Legs",
            "Bulgarian Split Squat": "Legs",
            "Standing Calf Raise": "Legs",
            "Calf Raise": "Legs",

            "Bicep Curl": "Arms",
            "Dumbbell Bicep Curl": "Arms",
            "Hammer Curl": "Arms",
            "Preacher Curl": "Arms",
            "Tricep Pushdown": "Arms",
            "Overhead Tricep Extension": "Arms",
            "Skull Crushers": "Arms",
            "Close Grip Bench Press": "Arms",

            "Cable Crunch": "Core",
            "Plank": "Core",
            "Hanging Leg Raise": "Core",
            "Russian Twist": "Core",
            "Bicycle Crunch": "Core",
            "Mountain Climbers": "Core",
            "Leg Raise": "Core",
            "Ab Wheel Rollout": "Core",

            "Treadmill Walk": "Cardio",
            "Treadmill Run": "Cardio",
            "Running": "Cardio",
            "Stationary Bike": "Cardio",
            "Outdoor Cycling": "Cardio",
            "Cycling": "Cardio",
            "Elliptical": "Cardio",
            "Rowing Machine": "Cardio",
            "Stair Climber": "Cardio",
            "Jump Rope": "Cardio"

        };


        return muscleMap[exerciseName] || "";

    }


    function normalizeCustomProgram(program) {

        if (!program) {
            return null;
        }


        let normalized = program;


        /*
         * Some backend responses may return
         * program_data as a JSON string.
         */

        if (
            normalized.program_data &&
            typeof normalized.program_data === "string"
        ) {

            try {

                normalized = {
                    ...normalized,
                    ...JSON.parse(
                        normalized.program_data
                    )
                };

            } catch (error) {

                console.warn(
                    "Unable to parse program_data:",
                    error
                );

            }

        }


        /*
         * Some responses may wrap the actual
         * program inside a program property.
         */

        if (
            normalized.program &&
            typeof normalized.program === "object"
        ) {

            normalized = {
                ...normalized,
                ...normalized.program
            };

        }


        if (!Array.isArray(normalized.days)) {

            return {
                ...normalized,
                days: []
            };

        }


        return normalized;

    }


    function renderCustomProgram(program) {

        const normalized =
            normalizeCustomProgram(program);


        if (
            !normalized ||
            !Array.isArray(normalized.days)
        ) {
            return false;
        }


        const programName =
            normalized.name ||
            "Custom Program";


        if (planPreview) {

            planPreview.style.display =
                "block";

        }


        if (selectedPlanTitle) {

            selectedPlanTitle.textContent =
                programName;

        }


        if (selectedPlanDescription) {

            selectedPlanDescription.textContent =
                "Your custom training program. Choose an exercise below and add it to your workout log.";

        }


        const pageTitle =
            document.getElementById(
                "workoutPageTitle"
            );


        if (pageTitle) {

            pageTitle.textContent =
                programName;

        }


        const pageSubtitle =
            document.getElementById(
                "workoutPageSubtitle"
            );


        if (pageSubtitle) {

            pageSubtitle.textContent =
                "Follow your saved program and log each exercise.";

        }


        if (!planExercises) {
            return true;
        }


        const days =
            normalized.days;


        if (!days.length) {

            planExercises.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No training days found
                    </h3>

                    <p>
                        This custom program does not contain any exercises yet.
                    </p>

                </div>

            `;

            return true;

        }


        const html = [];


        days.forEach(
            (day, dayIndex) => {

                const dayName =
                    day?.name ||
                    `Day ${dayIndex + 1}`;


                const dayExercises =
                    Array.isArray(day?.exercises)
                        ? day.exercises
                        : [];


                html.push(`

                    <div
                        class="custom-program-day"
                        style="
                            margin-bottom:18px;
                            padding:15px;
                            border:1px solid #e5eaf1;
                            border-radius:14px;
                        "
                    >

                        <h3
                            style="
                                margin:0 0 12px;
                            "
                        >
                            ${window.LIFT.escape(
                                dayName
                            )}
                        </h3>

                `);


                if (!dayExercises.length) {

                    html.push(`

                        <p
                            style="
                                margin:0;
                                color:#8b95a5;
                            "
                        >
                            No exercises added to this day.
                        </p>

                    `);

                } else {

                    dayExercises.forEach(
                        exerciseItem => {

                            let exerciseName = "";
                            let muscle = "Exercise";


                            /*
                             * Current custom programs store
                             * exercise names as strings.
                             */

                            if (
                                typeof exerciseItem ===
                                "string"
                            ) {

                                exerciseName =
                                    exerciseItem;

                            } else if (
                                exerciseItem &&
                                typeof exerciseItem ===
                                "object"
                            ) {

                                exerciseName =
                                    String(
                                        exerciseItem.exercise ??
                                        exerciseItem.name ??
                                        ""
                                    );


                                muscle =
                                    String(
                                        exerciseItem.muscle ??
                                        "Exercise"
                                    );

                            }


                            exerciseName =
                                exerciseName.trim();


                            if (!exerciseName) {
                                return;
                            }


                            if (
                                muscle === "Exercise"
                            ) {

                                const knownMuscle =
                                    getExerciseMuscle(
                                        exerciseName
                                    );


                                if (knownMuscle) {

                                    muscle =
                                        knownMuscle;

                                }

                            }


                            html.push(`

                                <div
                                    class="plan-exercise-item"
                                    style="
                                        display:flex;
                                        align-items:center;
                                        justify-content:space-between;
                                        gap:12px;
                                        padding:12px 0;
                                    "
                                >

                                    <div>

                                        <strong>
                                            ${window.LIFT.escape(
                                                exerciseName
                                            )}
                                        </strong>

                                        <span
                                            style="
                                                display:block;
                                                margin-top:3px;
                                            "
                                        >
                                            ${window.LIFT.escape(
                                                muscle
                                            )}
                                        </span>

                                    </div>


                                    <button
                                        type="button"
                                        class="btn btn-secondary plan-use-btn"
                                        data-exercise="${window.LIFT.escape(
                                            exerciseName
                                        )}"
                                        data-muscle="${window.LIFT.escape(
                                            muscle
                                        )}"
                                    >
                                        Use exercise
                                    </button>

                                </div>

                            `);

                        }
                    );

                }


                html.push(`

                    </div>

                `);

            }
        );


        planExercises.innerHTML =
            html.join("");


        return true;

    }


    async function loadCustomProgram() {

        const customProgramId =
            getCustomProgramId();


        if (!customProgramId) {
            return false;
        }


        try {

            /*
             * Load all custom programs belonging
             * to the current logged-in user.
             */

            const data =
                await window.LIFT.get(
                    `/library/programs/${encodeURIComponent(
                        username
                    )}`
                );


            const programs =
                Array.isArray(data?.programs)
                    ? data.programs
                    : [];


            const program =
                programs.find(
                    item =>
                        String(item.id) ===
                        String(customProgramId)
                );


            if (!program) {

                console.error(
                    "Custom program not found:",
                    customProgramId
                );


                if (planPreview) {

                    planPreview.style.display =
                        "block";

                }


                if (selectedPlanTitle) {

                    selectedPlanTitle.textContent =
                        "Program not found";

                }


                if (selectedPlanDescription) {

                    selectedPlanDescription.textContent =
                        "The saved custom program could not be loaded.";

                }


                if (planExercises) {

                    planExercises.innerHTML = `

                        <div class="empty-state">

                            <h3>
                                Unable to load program
                            </h3>

                            <p>
                                Please return to Library and try starting the program again.
                            </p>

                            <a
                                class="btn btn-secondary"
                                href="library.html"
                            >
                                Back to Library
                            </a>

                        </div>

                    `;

                }


                return true;

            }


            console.log(
                "GYMMAN custom program loaded:",
                program
            );


            renderCustomProgram(
                program
            );


            return true;

        } catch (error) {

            console.error(
                "Load custom program error:",
                error
            );


            if (planPreview) {

                planPreview.style.display =
                    "block";

            }


            if (selectedPlanTitle) {

                selectedPlanTitle.textContent =
                    "Unable to load program";

            }


            if (selectedPlanDescription) {

                selectedPlanDescription.textContent =
                    "Please check that the GYMMAN server is running and try again.";

            }


            if (planExercises) {

                planExercises.innerHTML = `

                    <div class="empty-state">

                        <h3>
                            Unable to load custom program
                        </h3>

                        <p>
                            Please return to Library and try again.
                        </p>

                        <a
                            class="btn btn-secondary"
                            href="library.html"
                        >
                            Back to Library
                        </a>

                    </div>

                `;

            }


            return true;

        }

    }


    /* --------------------------------
       RENDER SELECTED PLAN
    -------------------------------- */

    function loadSelectedPlan() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const planName =
            params.get("plan");


        if (!planName) return;


        const plan =
            trainingPlans[planName];


        if (!plan) return;


        planPreview.style.display =
            "block";


        selectedPlanTitle.textContent =
            planName;


        selectedPlanDescription.textContent =
            plan.description;


        document.getElementById(
            "workoutPageTitle"
        ).textContent =
            planName;


        document.getElementById(
            "workoutPageSubtitle"
        ).textContent =
            "Choose an exercise from this plan and add it to your training log.";


        planExercises.innerHTML =
            plan.exercises
                .map(exercise => {

                    return `

                        <div class="plan-exercise-item">

                            <div>

                                <strong>
                                    ${window.LIFT.escape(
                                        exercise[0]
                                    )}
                                </strong>

                                <span>
                                    ${window.LIFT.escape(
                                        exercise[1]
                                    )}
                                </span>

                            </div>

                            <button
                                type="button"
                                class="btn btn-secondary plan-use-btn"
                                data-exercise="${window.LIFT.escape(
                                    exercise[0]
                                )}"
                                data-muscle="${window.LIFT.escape(
                                    exercise[1]
                                )}"
                            >
                                Use exercise
                            </button>

                        </div>

                    `;

                })
                .join("");

    }


    /* --------------------------------
       RENDER WORKOUT LOG
    -------------------------------- */

    function render(workouts) {

        if (summary) {

            summary.textContent =
                `${workouts.length} exercise${
                    workouts.length === 1
                        ? ""
                        : "s"
                } logged`;

        }


        if (!workouts.length) {

            workoutList.innerHTML = `

                <div class="empty-state">

                    <h3>
                        Your training log is empty
                    </h3>

                    <p>
                        Add an exercise to start building your personal workout history.
                    </p>

                    <a
                        class="btn btn-primary"
                        href="exercises.html"
                    >
                        Explore exercises
                    </a>

                </div>

            `;

            return;

        }


        workoutList.innerHTML =
            workouts
                .map(workout => {

                    const weight =
                        Number(
                            workout.weight
                        ) || 0;


                    return `

                        <div class="workout-item">

                            <div class="activity-dot">
                                ${window.LIFT.escape(
                                    workout.muscle
                                )
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </div>


                            <div class="workout-main">

                                <strong>
                                    ${window.LIFT.escape(
                                        workout.exercise
                                    )}
                                </strong>

                                <span>
                                    ${window.LIFT.escape(
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


                            <button
                                class="icon-button"
                                type="button"
                                data-delete="${workout.id}"
                                aria-label="Delete workout"
                            >
                                ×
                            </button>

                        </div>

                    `;

                })
                .join("");

    }


    /* --------------------------------
       LOAD WORKOUTS
    -------------------------------- */

    async function load() {

        try {

            const data =
                await window.LIFT.get(
                    `/workouts/${encodeURIComponent(
                        username
                    )}`
                );


            render(
                data.workouts || []
            );


        } catch (error) {

            console.error(error);


            workoutList.innerHTML = `

                <div class="empty-state">

                    <h3>
                        Unable to load workouts
                    </h3>

                    <p>
                        Please check that the LIFT server is running and try again.
                    </p>

                </div>

            `;

        }

    }


    /* --------------------------------
       ADD WORKOUT
    -------------------------------- */

    addButton.addEventListener(
        "click",
        async () => {

            const exercise =
                exerciseInput.value.trim();


            const muscle =
                muscleInput.value;


            const enteredWeight =
                parseFloat(
                    weightInput.value
                );


            const sets =
                parseInt(
                    setsInput.value,
                    10
                );


            const reps =
                parseInt(
                    repsInput.value,
                    10
                );


            if (
                !exercise ||
                !muscle ||
                isNaN(enteredWeight) ||
                !sets ||
                !reps ||
                enteredWeight < 0 ||
                sets <= 0 ||
                reps <= 0
            ) {

                window.LIFT.toast(
                    "Enter the exercise, weight, sets and reps."
                );

                return;

            }


            /*
             * Database always stores weight in KG.
             *
             * LB input is converted to KG first.
             */

            let weightKg =
                enteredWeight;


            if (
                getWeightUnit() === "lb"
            ) {

                weightKg =
                    lbToKg(
                        enteredWeight
                    );

            }


            addButton.disabled =
                true;


            addButton.textContent =
                "Saving...";


            try {

                await window.LIFT.post(
                    "/workouts",
                    {
                        username,
                        exercise,
                        muscle,

                        weight:
                            Number(
                                weightKg.toFixed(3)
                            ),

                        sets,
                        reps
                    }
                );


                exerciseInput.value =
                    "";


                weightInput.value =
                    "";


                setsInput.value =
                    "";


                repsInput.value =
                    "";


                await load();


                window.LIFT.toast(
                    "Workout added successfully."
                );


            } catch (error) {

                window.LIFT.toast(
                    error.message
                );


            } finally {

                addButton.disabled =
                    false;


                addButton.textContent =
                    "Add to workout";

            }

        }
    );


    /* --------------------------------
       DELETE WORKOUT
    -------------------------------- */

    workoutList.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "[data-delete]"
                );


            if (!button) return;


            try {

                const response =
                    await window.LIFT.request(
                        `/workouts/${button.dataset.delete}`,
                        {
                            method: "DELETE",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    username
                                })
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Unable to delete workout."
                    );

                }


                await load();


                window.LIFT.toast(
                    "Workout removed."
                );


            } catch (error) {

                window.LIFT.toast(
                    "Unable to delete workout."
                );

            }

        }
    );


    /* --------------------------------
       USE PLAN / CUSTOM PROGRAM EXERCISE
    -------------------------------- */

    if (planExercises) {

        planExercises.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-exercise]"
                    );


                if (!button) return;


                exerciseInput.value =
                    button.dataset.exercise;


                muscleInput.value =
                    button.dataset.muscle;


                setsInput.value =
                    "3";


                repsInput.value =
                    "10";


                weightInput.focus();


                window.LIFT.toast(
                    `${button.dataset.exercise} selected.`
                );

            }
        );

    }


    /* --------------------------------
       EXERCISE URL PARAMETERS
       Used from Exercise Library
    -------------------------------- */

    const params =
        new URLSearchParams(
            window.location.search
        );


    if (params.get("exercise")) {

        exerciseInput.value =
            params.get("exercise");

    }


    if (params.get("muscle")) {

        muscleInput.value =
            params.get("muscle");

    }


    /* --------------------------------
       START
    -------------------------------- */

    async function initialize() {

        updateWeightUI();


        /*
         * If the URL contains customProgram,
         * load the actual saved program from MySQL.
         *
         * Otherwise use the normal built-in plan.
         */

        const customProgramLoaded =
            await loadCustomProgram();


        if (!customProgramLoaded) {

            loadSelectedPlan();

        }


        await load();

    }


    initialize();

})();