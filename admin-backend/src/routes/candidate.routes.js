const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
    createCandidate,
    getCandidates,
    exportToExcel,
} = require("../controllers/candidate.controller");

// Public route: Save info before interview
router.post("/", createCandidate);

// Admin routes: View and Export
router.get("/", authenticate, getCandidates);
router.get("/export", authenticate, exportToExcel);

module.exports = router;
