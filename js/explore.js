const plans = [
    [
        "Full Body Starter",
        "Beginner",
        "3 sessions / week",
        "45 min",
        "A balanced starting structure for consistent training.",
        true
    ],

    [
        "Upper Body Strength",
        "Strength",
        "4 sessions / week",
        "50 min",
        "Focus on chest, back, shoulders and arms.",
        false
    ],

    [
        "Lower Body Focus",
        "Strength",
        "2 sessions / week",
        "50 min",
        "A simple lower-body focused training structure.",
        false
    ],

    [
        "Push Day",
        "Intermediate",
        "1 session",
        "45 min",
        "Chest, shoulders and triceps in one focused session.",
        false
    ],

    [
        "Pull Day",
        "Intermediate",
        "1 session",
        "45 min",
        "Back and biceps with a clean pulling structure.",
        false
    ],

    [
        "Cardio Base",
        "Conditioning",
        "3 sessions / week",
        "30 min",
        "Build a simple and repeatable cardio habit.",
        false
    ]
];


document.getElementById("planGrid").innerHTML = plans.map(plan => {

    const name = plan[0];
    const level = plan[1];
    const sessions = plan[2];
    const duration = plan[3];
    const description = plan[4];
    const featured = plan[5];

    return `
        <article class="card plan-card ${featured ? "featured" : ""}">

            <span class="plan-label">
                ${featured ? "RECOMMENDED" : "LIFT TEMPLATE"}
            </span>

            <h3>${name}</h3>

            <p>${description}</p>

            <div class="plan-meta">
                <span>${level}</span>
                <span>${sessions}</span>
                <span>${duration}</span>
            </div>

            <a
                class="btn ${featured ? "btn-primary" : "btn-secondary"}"
                href="workout.html?plan=${encodeURIComponent(name)}"
            >
                Start with this
            </a>

        </article>
    `;

}).join("");