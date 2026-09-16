(function () {

    // =========================================================
    // GYMMAN — LIBRARY
    // =========================================================

    const USERNAME = String(
        window.LIFT?.username ||
        localStorage.getItem("currentUser") ||
        ""
    ).trim();

    if (!USERNAME) {
        window.location.href = "login.html";    
        return;
    }

    const USER_KEY = encodeURIComponent(USERNAME);

    const LOCAL_PROGRAMS_KEY =
        `lift_custom_programs_${USER_KEY}`;


    // =========================================================
    // EXERCISE DATABASE
    // =========================================================

    const exercises = [

        ["Bench Press", "Chest"],
        ["Incline Dumbbell Press", "Chest"],
        ["Dumbbell Bench Press", "Chest"],
        ["Incline Barbell Press", "Chest"],
        ["Chest Fly", "Chest"],
        ["Cable Crossover", "Chest"],
        ["Push Ups", "Chest"],
        ["Decline Bench Press", "Chest"],

        ["Lat Pulldown", "Back"],
        ["Seated Cable Row", "Back"],
        ["Barbell Row", "Back"],
        ["One Arm Dumbbell Row", "Back"],
        ["Pull Ups", "Back"],
        ["Assisted Pull Up", "Back"],
        ["Straight Arm Pulldown", "Back"],
        ["T Bar Row", "Back"],

        ["Shoulder Press", "Shoulders"],
        ["Dumbbell Shoulder Press", "Shoulders"],
        ["Lateral Raise", "Shoulders"],
        ["Front Raise", "Shoulders"],
        ["Rear Delt Fly", "Shoulders"],
        ["Face Pull", "Shoulders"],
        ["Arnold Press", "Shoulders"],
        ["Upright Row", "Shoulders"],

        ["Barbell Squat", "Legs"],
        ["Leg Press", "Legs"],
        ["Romanian Deadlift", "Legs"],
        ["Leg Extension", "Legs"],
        ["Leg Curl", "Legs"],
        ["Walking Lunges", "Legs"],
        ["Bulgarian Split Squat", "Legs"],
        ["Standing Calf Raise", "Legs"],

        ["Bicep Curl", "Arms"],
        ["Dumbbell Bicep Curl", "Arms"],
        ["Hammer Curl", "Arms"],
        ["Preacher Curl", "Arms"],
        ["Tricep Pushdown", "Arms"],
        ["Overhead Tricep Extension", "Arms"],
        ["Skull Crushers", "Arms"],
        ["Close Grip Bench Press", "Arms"],

        ["Cable Crunch", "Core"],
        ["Plank", "Core"],
        ["Hanging Leg Raise", "Core"],
        ["Russian Twist", "Core"],
        ["Bicycle Crunch", "Core"],
        ["Mountain Climbers", "Core"],
        ["Leg Raise", "Core"],
        ["Ab Wheel Rollout", "Core"],

        ["Treadmill Walk", "Cardio"],
        ["Treadmill Run", "Cardio"],
        ["Stationary Bike", "Cardio"],
        ["Outdoor Cycling", "Cardio"],
        ["Elliptical", "Cardio"],
        ["Rowing Machine", "Cardio"],
        ["Stair Climber", "Cardio"],
        ["Jump Rope", "Cardio"]

    ];


    // =========================================================
    // HELPERS
    // =========================================================

    function escape(value) {

        if (
            window.LIFT &&
            typeof window.LIFT.escape === "function"
        ) {
            return window.LIFT.escape(
                String(value ?? "")
            );
        }

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function toast(message) {

        if (
            window.LIFT &&
            typeof window.LIFT.toast === "function"
        ) {
            window.LIFT.toast(message);
        } else {
            alert(message);
        }

    }


    // =========================================================
    // FAVORITES
    // MYSQL IS THE SOURCE OF TRUTH
    // =========================================================

    let serverFavorites = [];


    function normalizeFavorites(data) {

        const raw =
            Array.isArray(data?.favorites)
                ? data.favorites
                : [];


        return raw
            .map(item => {

                if (typeof item === "string") {
                    return item.trim();
                }


                if (
                    item &&
                    typeof item === "object"
                ) {

                    return String(
                        item.exercise ??
                        item.name ??
                        item.exercise_name ??
                        ""
                    ).trim();

                }


                return "";

            })
            .filter(Boolean);

    }


    async function loadFavoritesFromServer() {

        try {

            const data =
                await window.LIFT.get(
                    `/library/favorites/${encodeURIComponent(USERNAME)}`
                );


            serverFavorites =
                normalizeFavorites(data);


            console.log(
                "GYMMAN Library — MySQL favorites:",
                serverFavorites
            );


            return serverFavorites;

        } catch (error) {

            console.error(
                "GYMMAN Library — Failed to load favorites:",
                error
            );


            /*
             * IMPORTANT:
             *
             * We intentionally DO NOT use old
             * localStorage favorites here.
             *
             * MySQL is the source of truth.
             */

            serverFavorites = [];


            return [];

        }

    }


    // =========================================================
    // LOCAL PROGRAM BACKUP
    // =========================================================

    function getLocalPrograms() {

        try {

            const saved =
                localStorage.getItem(
                    LOCAL_PROGRAMS_KEY
                );


            return saved
                ? JSON.parse(saved)
                : [];

        } catch (error) {

            console.warn(
                "Unable to read local programs:",
                error
            );


            return [];

        }

    }


    function saveLocalPrograms(programs) {

        try {

            localStorage.setItem(
                LOCAL_PROGRAMS_KEY,
                JSON.stringify(programs)
            );

        } catch (error) {

            console.warn(
                "Unable to save local programs:",
                error
            );

        }

    }


    // =========================================================
    // LOAD WORKOUTS + DIET
    // =========================================================

    async function loadLibraryData() {

        try {

            const [
                workoutData,
                dietData
            ] = await Promise.all([

                window.LIFT.get(
                    `/workouts/${encodeURIComponent(USERNAME)}`
                ),

                window.LIFT.get(
                    `/diet/${encodeURIComponent(USERNAME)}`
                )

            ]);


            const workouts =
                Array.isArray(workoutData?.workouts)
                    ? workoutData.workouts
                    : [];


            const workoutContainer =
                document.getElementById(
                    "libraryWorkouts"
                );


            if (workoutContainer) {

                if (workouts.length) {

                    workoutContainer.innerHTML =
                        workouts
                            .slice(0, 8)
                            .map(workout => {

                                const weight =
                                    Number(
                                        workout.weight
                                    ) || 0;


                                return `

                                    <div class="workout-item">

                                        <div class="activity-dot">
                                            ${escape(
                                                workout.muscle
                                            )
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </div>


                                        <div class="workout-main">

                                            <strong>
                                                ${escape(
                                                    workout.exercise
                                                )}
                                            </strong>

                                            <span>
                                                ${escape(
                                                    workout.muscle
                                                )}
                                            </span>

                                        </div>


                                        <div class="workout-meta">

                                            <span class="meta-pill">
                                                ${weight} kg
                                            </span>

                                            <span class="meta-pill">
                                                ${escape(
                                                    workout.sets
                                                )} × ${escape(
                                                    workout.reps
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                `;

                            })
                            .join("");

                } else {

                    workoutContainer.innerHTML = `

                        <div class="empty-state">

                            <h3>
                                No saved workouts
                            </h3>

                            <p>
                                Your workout history will appear here once you start logging.
                            </p>

                            <a
                                class="btn btn-primary"
                                href="workout.html"
                            >
                                Log workout
                            </a>

                        </div>

                    `;

                }

            }


            const diet =
                dietData?.diet || null;


            const dietContainer =
                document.getElementById(
                    "libraryDiet"
                );


            if (dietContainer) {

                if (diet) {

                    dietContainer.innerHTML = `

                        <div class="detail-list">

                            <div class="detail-row">

                                <span>
                                    Breakfast
                                </span>

                                <strong>
                                    ${escape(
                                        diet.breakfast ||
                                        "Not added"
                                    )}
                                </strong>

                            </div>


                            <div class="detail-row">

                                <span>
                                    Lunch
                                </span>

                                <strong>
                                    ${escape(
                                        diet.lunch ||
                                        "Not added"
                                    )}
                                </strong>

                            </div>


                            <div class="detail-row">

                                <span>
                                    Dinner
                                </span>

                                <strong>
                                    ${escape(
                                        diet.dinner ||
                                        "Not added"
                                    )}
                                </strong>

                            </div>


                            <div class="detail-row">

                                <span>
                                    Water
                                </span>

                                <strong>
                                    ${escape(
                                        diet.water || 0
                                    )} L
                                </strong>

                            </div>

                        </div>

                    `;

                } else {

                    dietContainer.innerHTML = `

                        <div class="empty-state">

                            <h3>
                                No diet plan yet
                            </h3>

                            <p>
                                Add your meals and water intake to keep nutrition in your library.
                            </p>

                            <a
                                class="btn btn-primary"
                                href="diet.html"
                            >
                                Create diet plan
                            </a>

                        </div>

                    `;

                }

            }

        } catch (error) {

            console.error(
                "Library workout/diet error:",
                error
            );

        }

    }


    // =========================================================
    // LOAD PROGRAMS FROM MYSQL
    // =========================================================

    async function loadProgramsFromServer() {

        try {

            const data =
                await window.LIFT.get(
                    `/library/programs/${encodeURIComponent(USERNAME)}`
                );


            const programs =
                Array.isArray(data?.programs)
                    ? data.programs
                    : [];


            /*
             * Keep a local backup for programs.
             *
             * This is NOT the source of truth.
             */

            if (programs.length) {
                saveLocalPrograms(programs);
            }


            return programs;

        } catch (error) {

            console.error(
                "Get programs error:",
                error
            );


            /*
             * Existing behavior:
             * temporarily use local program backup.
             */

            return getLocalPrograms();

        }

    }


    // =========================================================
    // RENDER FAVORITES
    // =========================================================

    function renderFavorites() {

        const container =
            document.getElementById(
                "favoritesList"
            );


        if (!container) {
            return;
        }


        const favorites =
            Array.isArray(serverFavorites)
                ? serverFavorites
                : [];


        console.log(
            "GYMMAN Library — rendering favorites:",
            favorites
        );


        if (!favorites.length) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No favorites yet
                    </h3>

                    <p>
                        Go to Exercises and click ☆ on an exercise to save it here.
                    </p>

                    <a
                        class="btn btn-secondary"
                        href="exercises.html"
                    >
                        Browse exercises
                    </a>

                </div>

            `;

            return;

        }


        container.innerHTML =
            favorites
                .map(name => {

                    const exercise =
                        exercises.find(
                            item =>
                                item[0] === name
                        );


                    const muscle =
                        exercise
                            ? exercise[1]
                            : "Exercise";


                    const initials =
                        String(name)
                            .split(/\s+/)
                            .map(word => word[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase();


                    return `

                        <div class="workout-item">

                            <div class="activity-dot">
                                ${escape(initials)}
                            </div>


                            <div class="workout-main">

                                <strong>
                                    ${escape(name)}
                                </strong>

                                <span>
                                    ${escape(muscle)}
                                </span>

                            </div>


                            <div
                                class="workout-meta"
                                style="
                                    display:flex;
                                    gap:8px;
                                "
                            >

                                <a
                                    class="btn btn-secondary"
                                    href="workout.html?exercise=${encodeURIComponent(name)}&muscle=${encodeURIComponent(muscle)}"
                                >
                                    Use
                                </a>


                                <button
                                    type="button"
                                    class="icon-button remove-favorite"
                                    data-remove-favorite="${encodeURIComponent(name)}"
                                >
                                    ×
                                </button>

                            </div>

                        </div>

                    `;

                })
                .join("");


        container
            .querySelectorAll(
                "[data-remove-favorite]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const encodedName =
                            button.dataset
                                .removeFavorite;


                        const name =
                            decodeURIComponent(
                                encodedName
                            );


                        button.disabled = true;


                        try {

                            await window.LIFT.delete(
                                "/library/favorites",
                                {
                                    username: USERNAME,
                                    exercise: name
                                }
                            );


                            serverFavorites =
                                serverFavorites.filter(
                                    item =>
                                        item !== name
                                );


                            renderFavorites();


                            toast(
                                "Removed from favorites."
                            );

                        } catch (error) {

                            console.error(
                                "Server favorite delete failed:",
                                error
                            );


                            button.disabled = false;


                            toast(
                                error.message ||
                                "Unable to remove favorite."
                            );

                        }

                    }
                );

            });

    }


    // =========================================================
    // RENDER PROGRAMS
    // =========================================================

    function renderPrograms(programs) {

        const container =
            document.getElementById(
                "programList"
            );


        if (!container) {
            return;
        }


        const safePrograms =
            Array.isArray(programs)
                ? programs
                : [];


        if (!safePrograms.length) {

            container.innerHTML = `

                <div
                    class="empty-state"
                    style="grid-column:1/-1;"
                >

                    <h3>
                        No programs created
                    </h3>

                    <p>
                        Create your first custom training program to get started.
                    </p>

                    <button
                        type="button"
                        class="btn btn-primary"
                        id="emptyCreateProgramBtn"
                    >
                        Create a program
                    </button>

                </div>

            `;

            return;

        }


        container.innerHTML =
            safePrograms
                .map(program => {

                    const days =
                        Array.isArray(program.days)
                            ? program.days
                            : [];


                    const totalExercises =
                        days.reduce(
                            (total, day) => {

                                const dayExercises =
                                    Array.isArray(
                                        day?.exercises
                                    )
                                        ? day.exercises.length
                                        : 0;


                                return total +
                                    dayExercises;

                            },
                            0
                        );


                    return `

                        <article class="card program-card">

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    align-items:flex-start;
                                    gap:15px;
                                "
                            >

                                <div>

                                    <span class="plan-label">
                                        CUSTOM PROGRAM
                                    </span>

                                    <h3>
                                        ${escape(
                                            program.name
                                        )}
                                    </h3>

                                </div>


                                <button
                                    type="button"
                                    class="favorite-program-btn"
                                    data-favorite-program="${escape(
                                        program.id
                                    )}"
                                    style="
                                        border:0;
                                        background:none;
                                        font-size:25px;
                                        cursor:pointer;
                                    "
                                >
                                    ${
                                        program.favorite
                                            ? "★"
                                            : "☆"
                                    }
                                </button>

                            </div>


                            <p>

                                ${days.length}
                                training day${
                                    days.length === 1
                                        ? ""
                                        : "s"
                                }

                                ·

                                ${totalExercises}
                                exercise${
                                    totalExercises === 1
                                        ? ""
                                        : "s"
                                }

                            </p>


                            <div
                                class="program-days"
                                style="
                                    display:flex;
                                    flex-wrap:wrap;
                                    gap:6px;
                                    margin:15px 0;
                                "
                            >

                                ${
                                    days
                                        .map(day => `

                                            <span class="tag">
                                                ${escape(
                                                    day.name
                                                )}
                                            </span>

                                        `)
                                        .join("")
                                }

                            </div>


                            <div
                                style="
                                    display:flex;
                                    gap:8px;
                                    flex-wrap:wrap;
                                "
                            >

                                <a
                                    class="btn btn-primary"
                                    href="workout.html?customProgram=${encodeURIComponent(
                                        program.id
                                    )}"
                                >
                                    Start program
                                </a>


                                <button
                                    type="button"
                                    class="btn btn-secondary delete-program"
                                    data-delete-program="${escape(
                                        program.id
                                    )}"
                                >
                                    Delete
                                </button>

                            </div>

                        </article>

                    `;

                })
                .join("");

    }


    // =========================================================
    // CREATE PROGRAM MODAL
    // =========================================================

    function openProgramModal() {

        if (
            document.getElementById(
                "programModal"
            )
        ) {
            return;
        }


        const overlay =
            document.createElement("div");


        overlay.id =
            "programModal";


        overlay.style.cssText = `

            position:fixed;
            inset:0;
            z-index:9999;
            background:rgba(15,23,42,.45);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:25px;
            overflow-y:auto;

        `;


        overlay.innerHTML = `

            <div
                style="
                    width:min(760px,100%);
                    max-height:90vh;
                    overflow-y:auto;
                    background:white;
                    border-radius:22px;
                    padding:30px;
                    box-shadow:0 25px 80px rgba(15,23,42,.2);
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        gap:20px;
                        margin-bottom:25px;
                    "
                >

                    <div>

                        <span class="eyebrow">
                            CUSTOM TRAINING
                        </span>

                        <h2>
                            Create new program
                        </h2>

                        <p>
                            Build your own split and add the exercises you want.
                        </p>

                    </div>


                    <button
                        type="button"
                        id="closeProgramModal"
                        class="icon-button"
                        style="font-size:24px;"
                    >
                        ×
                    </button>

                </div>


                <div class="form-group">

                    <label>
                        Program name
                    </label>

                    <input
                        class="form-input"
                        id="programName"
                        type="text"
                        placeholder="Example: Push Pull Legs"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Training days
                    </label>

                    <select
                        class="form-select"
                        id="programDays"
                    >

                        <option value="1">
                            1 Day
                        </option>

                        <option value="2">
                            2 Days
                        </option>

                        <option value="3" selected>
                            3 Days
                        </option>

                        <option value="4">
                            4 Days
                        </option>

                        <option value="5">
                            5 Days
                        </option>

                        <option value="6">
                            6 Days
                        </option>

                        <option value="7">
                            7 Days
                        </option>

                    </select>

                </div>


                <div id="programDaysContainer"></div>


                <div
                    style="
                        display:flex;
                        justify-content:flex-end;
                        gap:10px;
                        margin-top:25px;
                    "
                >

                    <button
                        type="button"
                        class="btn btn-secondary"
                        id="cancelProgram"
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        class="btn btn-primary"
                        id="saveProgram"
                    >
                        Save Program
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            overlay
        );


        renderProgramDays(3);


        const daysSelect =
            document.getElementById(
                "programDays"
            );


        if (daysSelect) {

            daysSelect.addEventListener(
                "change",
                event => {

                    renderProgramDays(
                        parseInt(
                            event.target.value,
                            10
                        )
                    );

                }
            );

        }


        const closeButton =
            document.getElementById(
                "closeProgramModal"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeProgramModal
            );

        }


        const cancelButton =
            document.getElementById(
                "cancelProgram"
            );


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeProgramModal
            );

        }


        const saveButton =
            document.getElementById(
                "saveProgram"
            );


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                saveNewProgram
            );

        }

    }


    // =========================================================
    // PROGRAM DAYS
    // =========================================================

    function renderProgramDays(count) {

        const container =
            document.getElementById(
                "programDaysContainer"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        for (
            let i = 1;
            i <= count;
            i++
        ) {

            const day =
                document.createElement("div");


            day.style.cssText = `

                border:1px solid #e1e7ef;
                border-radius:16px;
                padding:18px;
                margin-top:15px;

            `;


            day.innerHTML = `

                <h3>
                    Day ${i}
                </h3>


                <div
                    class="form-group"
                    style="margin-top:12px;"
                >

                    <label>
                        Day name
                    </label>

                    <input
                        class="form-input day-name"
                        type="text"
                        value="Day ${i}"
                        placeholder="Example: Push Day"
                    >

                </div>


                <div>

                    <label>
                        Exercises
                    </label>


                    <div
                        class="selected-exercises"
                        style="margin-top:10px;"
                    >

                        <p class="builder-empty">
                            No exercises added yet.
                        </p>

                    </div>

                </div>


                <div
                    style="
                        display:flex;
                        gap:8px;
                        margin-top:12px;
                    "
                >

                    <select
                        class="form-select exercise-select"
                        style="flex:1;"
                    >

                        <option value="">
                            Select exercise
                        </option>

                        ${
                            exercises
                                .map(
                                    exercise => `

                                        <option
                                            value="${escape(
                                                exercise[0]
                                            )}"
                                        >
                                            ${escape(
                                                exercise[0]
                                            )}
                                            — ${escape(
                                                exercise[1]
                                            )}
                                        </option>

                                    `
                                )
                                .join("")
                        }

                    </select>


                    <button
                        type="button"
                        class="btn btn-secondary add-day-exercise"
                    >
                        + Add
                    </button>

                </div>

            `;


            container.appendChild(day);


            const select =
                day.querySelector(
                    ".exercise-select"
                );


            const addButton =
                day.querySelector(
                    ".add-day-exercise"
                );


            const selectedList =
                day.querySelector(
                    ".selected-exercises"
                );


            addButton.addEventListener(
                "click",
                () => {

                    const exercise =
                        select.value;


                    if (!exercise) {

                        toast(
                            "Select an exercise first."
                        );

                        return;

                    }


                    const alreadyExists =
                        [
                            ...selectedList.children
                        ].some(
                            element =>
                                element.dataset
                                    .exercise ===
                                exercise
                        );


                    if (alreadyExists) {

                        toast(
                            "This exercise is already added."
                        );

                        return;

                    }


                    const empty =
                        selectedList.querySelector(
                            ".builder-empty"
                        );


                    if (empty) {
                        empty.remove();
                    }


                    const item =
                        document.createElement("div");


                    item.dataset.exercise =
                        exercise;


                    item.style.cssText = `

                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        padding:10px 12px;
                        border:1px solid #e5eaf1;
                        border-radius:10px;
                        margin-top:7px;

                    `;


                    const exerciseData =
                        exercises.find(
                            item =>
                                item[0] ===
                                exercise
                        );


                    item.innerHTML = `

                        <div>

                            <strong>
                                ${escape(
                                    exercise
                                )}
                            </strong>

                            <small
                                style="
                                    display:block;
                                    color:#8b95a5;
                                    margin-top:2px;
                                "
                            >
                                ${
                                    exerciseData
                                        ? escape(
                                            exerciseData[1]
                                        )
                                        : ""
                                }
                            </small>

                        </div>


                        <button
                            type="button"
                            class="icon-button remove-day-exercise"
                        >
                            ×
                        </button>

                    `;


                    selectedList.appendChild(
                        item
                    );


                    select.value = "";


                    const removeButton =
                        item.querySelector(
                            ".remove-day-exercise"
                        );


                    removeButton.addEventListener(
                        "click",
                        () => {

                            item.remove();


                            if (
                                !selectedList.querySelector(
                                    "[data-exercise]"
                                )
                            ) {

                                selectedList.innerHTML = `

                                    <p class="builder-empty">
                                        No exercises added yet.
                                    </p>

                                `;

                            }

                        }
                    );

                }
            );

        }

    }


    // =========================================================
    // SAVE NEW PROGRAM
    // =========================================================

    async function saveNewProgram() {

        const nameInput =
            document.getElementById(
                "programName"
            );


        const name =
            nameInput
                ? nameInput.value.trim()
                : "";


        if (!name) {

            toast(
                "Enter a program name."
            );

            return;

        }


        const dayElements =
            document.querySelectorAll(
                "#programDaysContainer > div"
            );


        const days = [];


        dayElements.forEach(
            (day, index) => {

                const nameElement =
                    day.querySelector(
                        ".day-name"
                    );


                const dayName =
                    nameElement
                        ? nameElement.value.trim()
                        : "";


                const exercisesInDay =
                    [
                        ...day.querySelectorAll(
                            "[data-exercise]"
                        )
                    ]
                        .map(
                            element =>
                                element.dataset
                                    .exercise
                        );


                days.push({

                    name:
                        dayName ||
                        `Day ${index + 1}`,

                    exercises:
                        exercisesInDay

                });

            }
        );


        if (
            !days.some(
                day =>
                    day.exercises.length > 0
            )
        ) {

            toast(
                "Add at least one exercise."
            );

            return;

        }


        const saveButton =
            document.getElementById(
                "saveProgram"
            );


        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                "Saving...";

        }


        const program = {

            name,

            days,

            favorite: false

        };


        try {

            const response =
                await window.LIFT.post(
                    "/library/programs",
                    {
                        username: USERNAME,
                        name,
                        program
                    }
                );


            const localPrograms =
                getLocalPrograms();


            localPrograms.push({

                id:
                    response?.programId ||
                    Date.now().toString(),

                name,

                days,

                favorite: false,

                createdAt:
                    new Date().toISOString()

            });


            saveLocalPrograms(
                localPrograms
            );


            closeProgramModal();


            const programs =
                await loadProgramsFromServer();


            renderPrograms(
                programs
            );


            toast(
                "Program created successfully."
            );


        } catch (error) {

            console.error(
                "Create program error:",
                error
            );


            /*
             * Preserve the existing local fallback
             * for custom programs.
             */

            const localPrograms =
                getLocalPrograms();


            const localProgram = {

                id:
                    Date.now().toString(),

                name,

                days,

                favorite: false,

                createdAt:
                    new Date().toISOString()

            };


            localPrograms.push(
                localProgram
            );


            saveLocalPrograms(
                localPrograms
            );


            closeProgramModal();


            renderPrograms(
                localPrograms
            );


            toast(
                "Program saved locally. Server could not be reached."
            );

        } finally {

            if (saveButton) {

                saveButton.disabled = false;

                saveButton.textContent =
                    "Save Program";

            }

        }

    }


    // =========================================================
    // CLOSE PROGRAM MODAL
    // =========================================================

    function closeProgramModal() {

        const modal =
            document.getElementById(
                "programModal"
            );


        if (modal) {
            modal.remove();
        }

    }


    // =========================================================
    // GLOBAL BUTTON HANDLING
    // =========================================================

    document.addEventListener(
        "click",
        async event => {

            // =================================================
            // CREATE PROGRAM
            // =================================================

            const createButton =
                event.target.closest(
                    "#createProgramBtn"
                );


            const emptyCreateButton =
                event.target.closest(
                    "#emptyCreateProgramBtn"
                );


            if (
                createButton ||
                emptyCreateButton
            ) {

                event.preventDefault();

                openProgramModal();

                return;

            }


            // =================================================
            // DELETE PROGRAM
            // =================================================

            const deleteButton =
                event.target.closest(
                    "[data-delete-program]"
                );


            if (deleteButton) {

                const id =
                    deleteButton.dataset
                        .deleteProgram;


                if (
                    !confirm(
                        "Delete this program?"
                    )
                ) {
                    return;
                }


                try {

                    await window.LIFT.delete(
                        `/library/programs/${encodeURIComponent(
                            id
                        )}`,
                        {
                            username: USERNAME
                        }
                    );


                    const updatedLocal =
                        getLocalPrograms()
                            .filter(
                                program =>
                                    String(
                                        program.id
                                    ) !==
                                    String(id)
                            );


                    saveLocalPrograms(
                        updatedLocal
                    );


                    const programs =
                        await loadProgramsFromServer();


                    renderPrograms(
                        programs
                    );


                    toast(
                        "Program deleted."
                    );


                } catch (error) {

                    console.error(
                        "Delete program error:",
                        error
                    );


                    toast(
                        error.message ||
                        "Unable to delete program."
                    );

                }


                return;

            }


            // =================================================
            // FAVORITE PROGRAM
            // =================================================

            const favoriteButton =
                event.target.closest(
                    "[data-favorite-program]"
                );


            if (favoriteButton) {

                const id =
                    favoriteButton.dataset
                        .favoriteProgram;


                const programs =
                    getLocalPrograms();


                const program =
                    programs.find(
                        item =>
                            String(item.id) ===
                            String(id)
                    );


                if (program) {

                    program.favorite =
                        !program.favorite;


                    saveLocalPrograms(
                        programs
                    );


                    renderPrograms(
                        programs
                    );

                }


                return;

            }

        }
    );


    // =========================================================
    // INITIALIZE
    // =========================================================

    async function initialize() {

        console.log(
            "GYMMAN Library initializing for:",
            USERNAME
        );


        // Load workouts and diet.
        await loadLibraryData();


        // Load favorites DIRECTLY from MySQL.
        await loadFavoritesFromServer();


        // Render MySQL favorites.
        renderFavorites();


        // Load custom programs.
        const programs =
            await loadProgramsFromServer();


        // Render custom programs.
        renderPrograms(
            programs
        );


        console.log(
            "GYMMAN Library initialized."
        );

    }


    initialize();

})();