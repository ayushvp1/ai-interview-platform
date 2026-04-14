const Candidate = require("../models/Candidate");
const { sendSuccess, sendError } = require("../utils/response");
const XLSX = require("xlsx");

/**
 * POST /candidates
 * Saves candidate info before interview starts.
 */
const createCandidate = async (req, res) => {
    try {
        const { name, email, phone, interviewType } = req.body;
        const candidate = await Candidate.create({ name, email, phone, interviewType });
        return sendSuccess(res, 201, "Candidate info saved.", candidate);
    } catch (err) {
        console.error("[candidate.controller] create error:", err);
        return sendError(res, 400, err.message);
    }
};

/**
 * GET /candidates
 * List all candidates for admin (protected).
 */
const getCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find().sort("-createdAt");
        return sendSuccess(res, 200, "Candidates retrieved.", candidates);
    } catch (err) {
        return sendError(res, 500, "Internal server error.");
    }
};

/**
 * GET /candidates/export
 * Exports candidates to an Excel file (protected).
 */
const exportToExcel = async (req, res) => {
    try {
        const candidates = await Candidate.find().lean();

        // Format data for Excel
        const data = candidates.map((c) => ({
            ID: c._id.toString(),
            Name: c.name,
            Email: c.email,
            Phone: c.phone,
            "Interview Type": c.interviewType,
            Status: c.status,
            "Signed Up At": new Date(c.createdAt).toLocaleString(),
        }));

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        // Send file
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=candidates_leads.xlsx");

        return res.end(buffer);
    } catch (err) {
        console.error("[candidate.controller] export error:", err);
        return sendError(res, 500, "Failed to generate Excel file.");
    }
};

module.exports = {
    createCandidate,
    getCandidates,
    exportToExcel,
};
