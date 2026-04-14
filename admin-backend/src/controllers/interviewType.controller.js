const InterviewType = require("../models/InterviewType");
const InterviewConfig = require("../models/InterviewConfig");
const { sendSuccess, sendError } = require("../utils/response");
const {
  createInterviewTypeSchema,
  updateInterviewTypeSchema,
} = require("../validators/interviewType.validator");

/**
 * GET /interview-types
 * Returns all non-deleted interview types.
 */
const getAllInterviewTypes = async (req, res) => {
  try {
    const types = await InterviewType.find().sort({ createdAt: -1 }).lean();
    return sendSuccess(res, 200, "Interview types retrieved successfully.", types);
  } catch (err) {
    console.error("[interviewType.controller] getAllInterviewTypes error:", err);
    return sendError(res, 500, "Failed to retrieve interview types.", err.message);
  }
};

/**
 * GET /interview-types/:id
 * Returns a single interview type along with its configuration.
 */
const getInterviewTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const type = await InterviewType.findById(id).lean();
    if (!type) {
      return sendError(res, 404, "Interview type not found.");
    }

    const config = await InterviewConfig.findOne({ interviewTypeId: id }).lean();

    return sendSuccess(res, 200, "Interview type retrieved successfully.", {
      ...type,
      config: config || null,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return sendError(res, 400, "Invalid interview type ID format.");
    }
    console.error("[interviewType.controller] getInterviewTypeById error:", err);
    return sendError(res, 500, "Failed to retrieve interview type.", err.message);
  }
};

/**
 * POST /interview-types
 * Creates a new interview type.
 */
const createInterviewType = async (req, res) => {
  try {
    const { error, value } = createInterviewTypeSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message).join(", ");
      return sendError(res, 400, messages);
    }

    const existing = await InterviewType.findOne({ name: value.name });
    if (existing) {
      return sendError(res, 409, `An interview type named "${value.name}" already exists.`);
    }

    const interviewType = await InterviewType.create(value);

    // Auto-create an empty config for this type
    await InterviewConfig.create({ interviewTypeId: interviewType._id, components: [] });

    return sendSuccess(res, 201, "Interview type created successfully.", interviewType);
  } catch (err) {
    if (err.code === 11000) {
      return sendError(res, 409, "An interview type with that name already exists.");
    }
    console.error("[interviewType.controller] createInterviewType error:", err);
    return sendError(res, 500, "Failed to create interview type.", err.message);
  }
};

/**
 * PUT /interview-types/:id
 * Updates an existing interview type (name, description, enabled, visibility, prerequisites).
 */
const updateInterviewType = async (req, res) => {
  try {
    const { id } = req.params;

    const { error, value } = updateInterviewTypeSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message).join(", ");
      return sendError(res, 400, messages);
    }

    const type = await InterviewType.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    }).lean();

    if (!type) {
      return sendError(res, 404, "Interview type not found.");
    }

    return sendSuccess(res, 200, "Interview type updated successfully.", type);
  } catch (err) {
    if (err.name === "CastError") {
      return sendError(res, 400, "Invalid interview type ID format.");
    }
    if (err.code === 11000) {
      return sendError(res, 409, "An interview type with that name already exists.");
    }
    console.error("[interviewType.controller] updateInterviewType error:", err);
    return sendError(res, 500, "Failed to update interview type.", err.message);
  }
};

/**
 * DELETE /interview-types/:id
 * Soft-deletes an interview type by setting deletedAt timestamp.
 */
const deleteInterviewType = async (req, res) => {
  try {
    const { id } = req.params;

    // Use updateOne to bypass the pre-find soft-delete filter
    const result = await InterviewType.updateOne(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return sendError(res, 404, "Interview type not found.");
    }

    return sendSuccess(res, 200, "Interview type deleted successfully.", null);
  } catch (err) {
    if (err.name === "CastError") {
      return sendError(res, 400, "Invalid interview type ID format.");
    }
    console.error("[interviewType.controller] deleteInterviewType error:", err);
    return sendError(res, 500, "Failed to delete interview type.", err.message);
  }
};

module.exports = {
  getAllInterviewTypes,
  getInterviewTypeById,
  createInterviewType,
  updateInterviewType,
  deleteInterviewType,
};
