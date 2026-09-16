const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, ".env")
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const initializeDatabase = require("./database/schema");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const bmiRoutes = require("./routes/bmiRoutes");
const caloriesRoutes = require("./routes/caloriesRoutes");
const dietRoutes = require("./routes/dietRoutes");
const libraryRoutes = require("./routes/libraryRoutes");

const app = express();

const PORT = process.env.PORT || 3000;


// ==========================================
// SECURITY HEADERS
// ==========================================

app.use(
    helmet({
        // CSP is disabled for now because the current
        // frontend uses inline scripts/styles.
        // Review and enable CSP before production hardening.
        contentSecurityPolicy: false
    })
);


// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
];

if (process.env.FRONTEND_ORIGIN) {

    const productionOrigin =
        process.env.FRONTEND_ORIGIN.replace(/\/$/, "");

    if (!allowedOrigins.includes(productionOrigin)) {
        allowedOrigins.push(productionOrigin);
    }
}

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests without an Origin header.
            // Example: direct server-to-server requests.
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("CORS origin not allowed.")
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


// ==========================================
// REQUEST BODY PARSING
// ==========================================

// Limit JSON request size to reduce abuse.
app.use(express.json({ limit: "100kb" }));


// ==========================================
// ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/bmi", bmiRoutes);
app.use("/api/calories", caloriesRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/library", libraryRoutes);


// ==========================================
// TEST / HEALTH ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.json({
        message: "GYMMAN backend is running."
    });
});


// ==========================================
// API 404 HANDLER
// ==========================================

app.use("/api", (req, res) => {

    res.status(404).json({
        error: "API endpoint not found."
    });
});


// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {

    console.error(
        "Request error:",
        error.message
    );


    // CORS errors
    if (error.message === "CORS origin not allowed.") {

        return res.status(403).json({
            error: "Origin not allowed."
        });
    }


    // JSON body too large
    if (
        error.type === "entity.too.large"
    ) {

        return res.status(413).json({
            error: "Request body is too large."
        });
    }


    // Invalid JSON
    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        error.type === "entity.parse.failed"
    ) {

        return res.status(400).json({
            error: "Invalid JSON."
        });
    }


    // Generic production-safe error
    return res.status(500).json({
        error: "Internal server error."
    });
});


// ==========================================
// START SERVER
// ==========================================

async function startServer() {

    try {

        await initializeDatabase();

        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    `GYMMAN backend running on port ${PORT}`
                );
            }
        );

    } catch (error) {

        console.error(
            "Failed to start GYMMAN backend:",
            error.message
        );

        process.exit(1);
    }
}

startServer();