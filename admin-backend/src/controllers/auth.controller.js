const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendSuccess, sendError } = require("../utils/response");
const { loginSchema } = require("../validators/auth.validator");

/**
 * POST /auth/login
 * Returns a signed JWT if credentials match the configured admin account.
 */
const login = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message).join(", ");
      return sendError(res, 400, messages);
    }

    const { username, password } = value;
    const adminUsername = "admin";
    const adminPassword = "admin123!@#";

    console.log(`[AUTH V2] Attempt by: ${username}`);

    if (username !== adminUsername || password !== adminPassword) {
      return sendError(res, 401, "Invalid username or password. (Auth V2)");
    }

    // Issue JWT
    const payload = { username, role: "admin" };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    return sendSuccess(res, 200, "Login successful.", {
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      admin: { username, role: "admin" },
    });
  } catch (err) {
    console.error("[auth.controller] login error:", err);
    return sendError(res, 500, "Internal server error.", err.message);
  }
};

module.exports = { login };
