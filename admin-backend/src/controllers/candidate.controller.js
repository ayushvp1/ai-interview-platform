const Candidate = require("../models/Candidate");
const { sendSuccess, sendError } = require("../utils/response");
const XLSX = require("xlsx");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });
};


/**
 * POST /candidates/register
 * Signs up a new candidate.
 */
const registerCandidate = async (req, res) => {
    try {
        const { name, email, phone, interviewType, password } = req.body;
        
        // Check if candidate already exists
        const existingCandidate = await Candidate.findOne({ email });
        if (existingCandidate) return sendError(res, 400, "Email already registered.");

        const candidate = await Candidate.create({ name, email, phone, interviewType, password });
        
        const token = signToken(candidate._id);
        
        return sendSuccess(res, 201, "Account created successfully.", {
            token,
            candidate: {
                _id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                interviewType: candidate.interviewType
            }
        });
    } catch (err) {
        console.error("[candidate.controller] register error:", err);
        return sendError(res, 400, err.message);
    }
};

/**
 * POST /candidates/login
 * Authenticates a candidate.
 */
const loginCandidate = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return sendError(res, 400, "Please provide email and password.");

        const candidate = await Candidate.findOne({ email });
        if (!candidate || !(await candidate.comparePassword(password))) {
            return sendError(res, 401, "Invalid email or password.");
        }

        const token = signToken(candidate._id);

        return sendSuccess(res, 200, "Logged in successfully.", {
            token,
            candidate: {
                _id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                interviewType: candidate.interviewType
            }
        });
    } catch (err) {
        return sendError(res, 500, "Internal server error.");
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

/**
 * PUT /candidates/:id
 * Updates candidate details.
 */
const updateCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, interviewType, status } = req.body;
        const candidate = await Candidate.findByIdAndUpdate(
            id,
            { name, email, phone, interviewType, status },
            { new: true, runValidators: true }
        );
        if (!candidate) return sendError(res, 404, "Candidate not found.");
        return sendSuccess(res, 200, "Candidate updated.", candidate);
    } catch (err) {
        console.error("[candidate.controller] update error:", err);
        return sendError(res, 400, err.message);
    }
};

/**
 * DELETE /candidates/:id
 * Removes a candidate lead.
 */
const deleteCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = await Candidate.findByIdAndDelete(id);
        if (!candidate) return sendError(res, 404, "Candidate not found.");
        return sendSuccess(res, 200, "Candidate deleted.");
    } catch (err) {
        console.error("[candidate.controller] delete error:", err);
        return sendError(res, 500, "Internal server error.");
    }
};

/**
 * POST /candidates/forgot-password
 * Sends a 6-digit OTP to user's email.
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const candidate = await Candidate.findOne({ email });
        if (!candidate) return sendError(res, 404, "No candidate found with that email.");

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        candidate.resetOTP = otp;
        candidate.resetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await candidate.save({ validateBeforeSave: false });

        const message = `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`;

        try {
            await sendEmail({
                email: candidate.email,
                subject: "Your Password Reset OTP",
                message,
            });
            return sendSuccess(res, 200, "OTP sent to email.");
        } catch (err) {
            console.error("[forgotPassword] Email send error:", err);
            candidate.resetOTP = undefined;
            candidate.resetOTPExpires = undefined;
            await candidate.save({ validateBeforeSave: false });
            return sendError(res, 500, "Error sending email. Please try again later.");
        }
    } catch (err) {
        return sendError(res, 500, "Internal server error.");
    }
};

/**
 * POST /candidates/verify-otp
 * Verifies the OTP provided by the user.
 */
const verifyOTP = async (req, res) => {
    try {
        let { email, otp } = req.body;
        otp = otp.replace(/\s/g, ''); // Remove any spaces
        const candidate = await Candidate.findOne({
            email,
            resetOTP: otp,
            resetOTPExpires: { $gt: Date.now() },
        });

        if (!candidate) return sendError(res, 400, "Invalid or expired OTP.");

        return sendSuccess(res, 200, "OTP verified. You can now reset your password.");
    } catch (err) {
        return sendError(res, 500, "Internal server error.");
    }
};

/**
 * POST /candidates/reset-password
 * Resets the password after OTP verification.
 */
const resetPassword = async (req, res) => {
    try {
        let { email, otp, password } = req.body;
        otp = otp.replace(/\s/g, ''); // Remove any spaces
        const candidate = await Candidate.findOne({
            email,
            resetOTP: otp,
            resetOTPExpires: { $gt: Date.now() },
        });

        if (!candidate) return sendError(res, 400, "Invalid or expired OTP.");

        candidate.password = password;
        candidate.resetOTP = undefined;
        candidate.resetOTPExpires = undefined;
        await candidate.save();

        const token = signToken(candidate._id);

        return sendSuccess(res, 200, "Password reset successfully.", { token });
    } catch (err) {
        return sendError(res, 400, err.message);
    }
};

module.exports = {
    registerCandidate,
    loginCandidate,
    forgotPassword,
    verifyOTP,
    resetPassword,
    getCandidates,
    updateCandidate,
    deleteCandidate,
    exportToExcel,
};
