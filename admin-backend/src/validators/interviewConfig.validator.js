const Joi = require("joi");

const componentSettingsSchema = Joi.object({
  questions: Joi.number().integer().min(1).max(100).optional(),
  timeLimit: Joi.number().integer().min(1).max(480).optional(),
  difficulty: Joi.string().valid("easy", "medium", "hard", "mixed").optional(),
  passingScore: Joi.number().integer().min(0).max(100).optional(),
});

const componentSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "Component name is required",
    "any.required": "Component name is required",
  }),
  settings: componentSettingsSchema.optional(),
});

const updateInterviewConfigSchema = Joi.object({
  components: Joi.array()
    .items(componentSchema)
    .max(20)
    .required()
    .messages({
      "any.required": "Components array is required",
      "array.max": "Cannot have more than 20 components",
    }),
});

module.exports = { updateInterviewConfigSchema };
