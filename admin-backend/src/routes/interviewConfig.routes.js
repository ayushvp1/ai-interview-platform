const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  updateInterviewConfig,
  getInterviewConfig,
} = require("../controllers/interviewConfig.controller");

// All routes are protected by JWT auth
router.use(authenticate);

// GET /interview-config/:interviewTypeId → get config
// PUT /interview-config/:interviewTypeId → update components & settings
router.route("/:interviewTypeId")
  .get(getInterviewConfig)
  .put(updateInterviewConfig);

module.exports = router;
