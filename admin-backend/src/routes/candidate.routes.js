const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
    registerCandidate,
    loginCandidate,
    forgotPassword,
    verifyOTP,
    resetPassword,
    getCandidates,
    updateCandidate,
    deleteCandidate,
    exportToExcel,
} = require("../controllers/candidate.controller");

// Public Auth routes
router.post("/register", registerCandidate);
router.post("/login", loginCandidate);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// Admin routes: View, Update, Delete, and Export
router.get("/", authenticate, getCandidates);
router.put("/:id", authenticate, updateCandidate);
router.delete("/:id", authenticate, deleteCandidate);
router.get("/export", authenticate, exportToExcel);

module.exports = router;
