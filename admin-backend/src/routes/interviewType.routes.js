const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getAllInterviewTypes,
  getInterviewTypeById,
  createInterviewType,
  updateInterviewType,
  deleteInterviewType,
} = require("../controllers/interviewType.controller");

// All routes are protected by JWT auth
router.use(authenticate);

// GET  /interview-types       → list all
// POST /interview-types       → create new
router.route("/")
  .get(getAllInterviewTypes)
  .post(createInterviewType);

// GET    /interview-types/:id → details + config
// PUT    /interview-types/:id → update
// DELETE /interview-types/:id → soft delete
router.route("/:id")
  .get(getInterviewTypeById)
  .put(updateInterviewType)
  .delete(deleteInterviewType);

module.exports = router;
