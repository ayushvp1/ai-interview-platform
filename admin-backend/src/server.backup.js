const path = require("path");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require(path.join(__dirname, "config", "db.js"));
const { sendError } = require(path.join(__dirname, "utils", "response.js"));

// Route imports
const authRoutes = require(path.join(__dirname, "routes", "authr.js"));
const interviewTypeRoutes = require(path.join(__dirname, "routes", "interviewType.routes.js"));
const interviewConfigRoutes = require(path.join(__dirname, "routes", "interviewConfig.routes.js"));

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin API is running",
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
    error: null,
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/interview-types", interviewTypeRoutes);
app.use("/interview-config", interviewConfigRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found.`);
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[server] Unhandled error:", err);
  sendError(
    res,
    err.status || 500,
    err.message || "Internal server error.",
    process.env.NODE_ENV === "development" ? err.stack : undefined
  );
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Admin backend running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
  });
};

start();
