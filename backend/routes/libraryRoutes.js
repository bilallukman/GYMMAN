const express = require("express");

const {
    getFavorites,
    addFavorite,
    deleteFavorite,
    getPrograms,
    createProgram,
    deleteProgram
} = require("../controllers/favoritesController");

const {
    requireAuth
} = require("../middleware/auth");

const router = express.Router();


// ==========================================
// FAVORITES
// ==========================================

router.get("/favorites/:username", requireAuth, getFavorites);

router.post("/favorites", requireAuth, addFavorite);

router.delete("/favorites", requireAuth, deleteFavorite);


// ==========================================
// CUSTOM PROGRAMS
// ==========================================

router.get("/programs/:username", requireAuth, getPrograms);

router.post("/programs", requireAuth, createProgram);

router.delete("/programs/:id", requireAuth, deleteProgram);


module.exports = router;