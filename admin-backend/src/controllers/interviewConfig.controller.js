const InterviewConfig = require("../models/InterviewConfig");
const InterviewType = require("../models/InterviewType");
const { sendSuccess, sendError } = require("../utils/response");
const { updateInterviewConfigSchema } = require("../validators/interviewConfig.validator");

/**
 * PUT /interview-config/:interviewTypeId
 * Replaces the component settings for a given interview type.
 * Creates a config document if one doesn't exist yet (upsert).
 */
const updateInterviewConfig = async (req, res) => {
  try {
    const { interviewTypeId } = req.params;

    // Validate body
    const { error, value } = updateInterviewConfigSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message).join(", ");
      return sendError(res, 400, messages);
    }

    // Ensure the parent interview type exists and is not deleted
    const type = await InterviewType.findById(interviewTypeId).lean();
    if (!type) {
      return sendError(res, 404, "Interview type not found.");
    }

    // Upsert config
    const config = await InterviewConfig.findOneAndUpdate(
      { interviewTypeId },
      {
        $set: {
          components: value.components,
          updatedAt: new Date(),
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    return sendSuccess(res, 200, "Interview configuration updated successfully.", config);
  } catch (err) {
    if (err.name === "CastError") {
      return sendError(res, 400, "Invalid interview type ID format.");
    }
    console.error("[interviewConfig.controller] updateInterviewConfig error:", err);
    return sendError(res, 500, "Failed to update interview configuration.", err.message);
  }
};

/**
 * GET /interview-config/:interviewTypeId
 * Returns the configuration for a given interview type.
 */
const getInterviewConfig = async (req, res) => {
  try {
    const { interviewTypeId } = req.params;

    // Ensure parent type exists
    const type = await InterviewType.findById(interviewTypeId).lean();
    if (!type) {
      return sendError(res, 404, "Interview type not found.");
    }

    const config = await InterviewConfig.findOne({ interviewTypeId }).lean();
    if (!config) {
      return sendError(res, 404, "No configuration found for this interview type.");
    }

    return sendSuccess(res, 200, "Interview configuration retrieved successfully.", config);
  } catch (err) {
    if (err.name === "CastError") {
      return sendError(res, 400, "Invalid interview type ID format.");
    }
    console.error("[interviewConfig.controller] getInterviewConfig error:", err);
    return sendError(res, 500, "Failed to retrieve interview configuration.", err.message);
  }
};

module.exports = { updateInterviewConfig, getInterviewConfig };
