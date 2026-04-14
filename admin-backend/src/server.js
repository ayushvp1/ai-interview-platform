require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

console.log("Starting server...");

const connectDB = require("./config/db.js");
const { sendError } = require("./utils/response.js");

// Route imports
console.log("Loading routes...");
const authRoutes = require("./routes/auth.routes.js");
const interviewTypeRoutes = require("./routes/interviewType.routes.js");
const interviewConfigRoutes = require("./routes/interviewConfig.routes.js");
const candidateRoutes = require("./routes/candidate.routes.js");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Admin API is running" });
});

app.use("/auth", authRoutes);
app.use("/interview-types", interviewTypeRoutes);
app.use("/interview-config", interviewConfigRoutes);
app.use("/candidates", candidateRoutes);

app.use((req, res) => {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found.`);
});

app.use((err, req, res, next) => {
  console.error("[server] Unhandled error:", err);
  sendError(res, err.status || 500, err.message || "Internal server error.");
});

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Admin backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

start();