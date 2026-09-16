const exercises = [

    // =========================
    // CHEST
    // =========================

    ["Bench Press","Chest","Strength","Barbell press for chest strength."],
    ["Incline Dumbbell Press","Chest","Strength","Upper-chest focused dumbbell press."],
    ["Dumbbell Bench Press","Chest","Strength","Dumbbell pressing movement for the chest."],
    ["Incline Barbell Press","Chest","Strength","Barbell press targeting the upper chest."],
    ["Chest Fly","Chest","Accessory","Controlled movement to isolate the chest."],
    ["Cable Crossover","Chest","Accessory","Cable exercise for chest contraction."],
    ["Push Ups","Chest","Bodyweight","Classic bodyweight chest exercise."],
    ["Decline Bench Press","Chest","Strength","Pressing movement focused on the lower chest."],

    // =========================
    // BACK
    // =========================

    ["Lat Pulldown","Back","Strength","Vertical pull for the upper back and lats."],
    ["Seated Cable Row","Back","Strength","Controlled horizontal pulling movement."],
    ["Barbell Row","Back","Strength","Compound rowing movement for the back."],
    ["One Arm Dumbbell Row","Back","Strength","Single-arm rowing movement for the lats and upper back."],
    ["Pull Ups","Back","Bodyweight","Bodyweight vertical pulling exercise."],
    ["Assisted Pull Up","Back","Strength","Machine-assisted vertical pulling movement."],
    ["Straight Arm Pulldown","Back","Accessory","Isolation movement targeting the lats."],
    ["T Bar Row","Back","Strength","Heavy rowing movement for back thickness."],

    // =========================
    // SHOULDERS
    // =========================

    ["Shoulder Press","Shoulders","Strength","Press overhead to train the shoulders."],
    ["Dumbbell Shoulder Press","Shoulders","Strength","Dumbbell overhead press for shoulder strength."],
    ["Lateral Raise","Shoulders","Accessory","Build the side delts with controlled raises."],
    ["Front Raise","Shoulders","Accessory","Isolation movement for the front delts."],
    ["Rear Delt Fly","Shoulders","Accessory","Targets the rear deltoids and upper back."],
    ["Face Pull","Shoulders","Accessory","Cable movement for rear delts and shoulder health."],
    ["Arnold Press","Shoulders","Strength","Rotational dumbbell press for complete shoulder development."],
    ["Upright Row","Shoulders","Strength","Pulling movement targeting the shoulders and traps."],

    // =========================
    // LEGS
    // =========================

    ["Barbell Squat","Legs","Strength","Compound lower-body movement."],
    ["Leg Press","Legs","Strength","Machine-based lower-body press."],
    ["Romanian Deadlift","Legs","Strength","Hip-hinge movement targeting hamstrings and glutes."],
    ["Leg Extension","Legs","Accessory","Machine exercise focused on the quadriceps."],
    ["Leg Curl","Legs","Accessory","Machine exercise targeting the hamstrings."],
    ["Walking Lunges","Legs","Strength","Single-leg movement for quads and glutes."],
    ["Bulgarian Split Squat","Legs","Strength","Single-leg squat variation for lower-body strength."],
    ["Standing Calf Raise","Legs","Accessory","Standing calf exercise for lower-leg development."],

    // =========================
    // ARMS
    // =========================

    ["Bicep Curl","Arms","Accessory","Simple elbow-flexion movement for biceps."],
    ["Dumbbell Bicep Curl","Arms","Accessory","Dumbbell curl for controlled biceps training."],
    ["Hammer Curl","Arms","Accessory","Neutral-grip curl targeting the biceps and forearms."],
    ["Preacher Curl","Arms","Accessory","Supported curl that isolates the biceps."],
    ["Tricep Pushdown","Arms","Accessory","Cable movement targeting the triceps."],
    ["Overhead Tricep Extension","Arms","Accessory","Overhead movement targeting the triceps."],
    ["Skull Crushers","Arms","Strength","Lying triceps extension exercise."],
    ["Close Grip Bench Press","Arms","Strength","Pressing movement with greater triceps emphasis."],

    // =========================
    // CORE
    // =========================

    ["Cable Crunch","Core","Core","Loaded flexion movement for the core."],
    ["Plank","Core","Core","Isometric exercise for core stability."],
    ["Hanging Leg Raise","Core","Core","Bodyweight movement targeting the lower abs."],
    ["Russian Twist","Core","Core","Rotational movement for the abdominal muscles."],
    ["Bicycle Crunch","Core","Core","Dynamic abdominal exercise with rotation."],
    ["Mountain Climbers","Core","Cardio","Dynamic movement combining core and conditioning."],
    ["Leg Raise","Core","Core","Controlled leg movement targeting the abs."],
    ["Ab Wheel Rollout","Core","Strength","Advanced core stability and anti-extension exercise."],

    // =========================
    // CARDIO
    // =========================

    ["Treadmill Walk","Cardio","Cardio","Simple steady-state conditioning."],
    ["Treadmill Run","Cardio","Cardio","Running-based cardiovascular exercise."],
    ["Stationary Bike","Cardio","Cardio","Low-impact cycling for cardiovascular fitness."],
    ["Outdoor Cycling","Cardio","Cardio","Cycling activity for endurance and conditioning."],
    ["Elliptical","Cardio","Cardio","Low-impact full-body cardiovascular exercise."],
    ["Rowing Machine","Cardio","Cardio","Full-body cardio movement using a rowing machine."],
    ["Stair Climber","Cardio","Cardio","Stair-based conditioning for endurance and lower body."],
    ["Jump Rope","Cardio","Cardio","High-intensity skipping exercise for conditioning."]

];


const muscles = [
    "All",
    "Chest",
    "Back",
    "Shoulders",
    "Legs",
    "Arms",
    "Core",
    "Cardio"
];


let selected = "All";

const USERNAME =
    String(window.LIFT.username || "").trim();

let favorites = [];


const grid =
    document.getElementById("exerciseGrid");

const search =
    document.getElementById("exerciseSearch");

const filters =
    document.getElementById("filters");


/* =========================
   LOAD FAVORITES FROM DATABASE
========================= */

async function loadFavorites() {

    try {

        const data =
            await window.LIFT.get(
                `/library/favorites/${encodeURIComponent(USERNAME)}`
            );

        favorites =
            (data.favorites || []).map(item =>
                typeof item === "string"
                    ? item
                    : item.exercise
            );

    } catch (error) {

        console.error(
            "Favorites load error:",
            error
        );

        favorites = [];

        window.LIFT.toast(
            "Unable to load favorites."
        );

    }

}


/* =========================
   FAVORITE CHECK
========================= */

function isFavorite(exerciseName) {

    return favorites.includes(
        exerciseName
    );

}


/* =========================
   TOGGLE FAVORITE
========================= */

async function toggleFavorite(
    exerciseName,
    button
) {

    const currentlyFavorite =
        isFavorite(exerciseName);


    if (button) {

        button.disabled = true;

    }


    try {

        if (!currentlyFavorite) {

            const response =
                await window.LIFT.request(
                    "/library/favorites",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                username:
                                    USERNAME,

                                exercise:
                                    exerciseName
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to add favorite."
                );

            }


            favorites.push(
                exerciseName
            );


            window.LIFT.toast(
                "Added to favorites."
            );


        } else {

            const response =
                await window.LIFT.request(
                    "/library/favorites",
                    {
                        method: "DELETE",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                username:
                                    USERNAME,

                                exercise:
                                    exerciseName
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to remove favorite."
                );

            }


            favorites =
                favorites.filter(
                    item =>
                        item !== exerciseName
                );


            window.LIFT.toast(
                "Removed from favorites."
            );

        }


        render();


    } catch (error) {

        console.error(
            "Favorite error:",
            error
        );


        window.LIFT.toast(
            error.message ||
            "Unable to update favorite."
        );


    } finally {

        if (button) {

            button.disabled = false;

        }

    }

}


/* =========================
   CREATE FILTER BUTTONS
========================= */

filters.innerHTML =
    muscles.map(
        muscle => `

            <button
                class="filter-btn ${
                    muscle === selected
                        ? "active"
                        : ""
                }"
                data-filter="${muscle}"
                type="button"
            >
                ${muscle}
            </button>

        `
    ).join("");


/* =========================
   RENDER EXERCISES
========================= */

function render() {

    const query =
        search.value
            .trim()
            .toLowerCase();


    const list =
        exercises.filter(
            item =>

                (
                    selected === "All" ||
                    item[1] === selected
                )

                &&

                `${item[0]} ${item[1]} ${item[2]}`
                    .toLowerCase()
                    .includes(query)
        );


    grid.innerHTML =
        list.map(
            item => {

                const initial =
                    item[0]
                        .split(" ")
                        .map(
                            word =>
                                word[0]
                        )
                        .join("")
                        .slice(0, 2);


                const favorite =
                    isFavorite(item[0]);


                return `

                    <article
                        class="card exercise-card"
                    >

                        <div
                            class="exercise-visual"
                            style="position:relative;"
                        >

                            <strong>
                                ${initial}
                            </strong>


                            <button
                                type="button"
                                class="exercise-favorite-btn"
                                data-favorite="${encodeURIComponent(item[0])}"
                                title="${
                                    favorite
                                        ? "Remove from favorites"
                                        : "Add to favorites"
                                }"
                                style="
                                    position:absolute;
                                    top:12px;
                                    right:12px;
                                    width:38px;
                                    height:38px;
                                    border:0;
                                    border-radius:50%;
                                    background:#ffffff;
                                    font-size:22px;
                                    cursor:pointer;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    box-shadow:0 4px 12px rgba(15,23,42,.08);
                                "
                            >
                                ${
                                    favorite
                                        ? "★"
                                        : "☆"
                                }
                            </button>

                        </div>


                        <h3>
                            ${window.LIFT.escape(
                                item[0]
                            )}
                        </h3>


                        <p>
                            ${window.LIFT.escape(
                                item[3]
                            )}
                        </p>


                        <div
                            class="exercise-tags"
                        >

                            <span class="tag">
                                ${window.LIFT.escape(
                                    item[1]
                                )}
                            </span>

                            <span class="tag">
                                ${window.LIFT.escape(
                                    item[2]
                                )}
                            </span>

                        </div>


                        <div
                            style="
                                display:flex;
                                gap:8px;
                                margin-top:12px;
                            "
                        >

                            <a
                                class="btn btn-secondary"
                                style="width:100%"
                                href="workout.html?exercise=${encodeURIComponent(item[0])}&muscle=${encodeURIComponent(item[1])}"
                            >
                                Add to workout
                            </a>

                        </div>

                    </article>

                `;

            }
        ).join("")

        ||

        `

            <div
                class="empty-state"
                style="grid-column:1/-1"
            >

                <h3>
                    No exercises found
                </h3>

                <p>
                    Try a different search or muscle group.
                </p>

            </div>

        `;


    /* =========================
       FAVORITE BUTTON EVENTS
    ========================= */

    document
        .querySelectorAll(
            "[data-favorite]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        const name =
                            decodeURIComponent(
                                button.dataset.favorite
                            );


                        toggleFavorite(
                            name,
                            button
                        );

                    }
                );

            }
        );

}


/* =========================
   FILTER EVENTS
========================= */

filters.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-filter]"
            );


        if (!button) return;


        selected =
            button.dataset.filter;


        document
            .querySelectorAll(
                ".filter-btn"
            )
            .forEach(
                item =>
                    item.classList.toggle(
                        "active",
                        item === button
                    )
            );


        render();

    }
);


/* =========================
   SEARCH
========================= */

search.addEventListener(
    "input",
    render
);


/* =========================
   INITIAL LOAD
========================= */

async function initializeExercises() {

    await loadFavorites();

    render();

}


initializeExercises();