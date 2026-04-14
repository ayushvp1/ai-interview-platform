const Joi = require("joi");

const createInterviewTypeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),
  description: Joi.string().trim().max(500).allow("").optional(),
  enabled: Joi.boolean().optional(),
  visibility: Joi.string().valid("public", "private", "restricted").optional(),
  prerequisites: Joi.array().items(Joi.string().trim()).max(20).optional(),
});

const updateInterviewTypeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().max(500).allow("").optional(),
  enabled: Joi.boolean().optional(),
  visibility: Joi.string().valid("public", "private", "restricted").optional(),
  prerequisites: Joi.array().items(Joi.string().trim()).max(20).optional(),
}).min(1).messages({
  "object.min": "At least one field must be provided for update",
});

module.exports = { createInterviewTypeSchema, updateInterviewTypeSchema };
