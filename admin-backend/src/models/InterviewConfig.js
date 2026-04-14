const mongoose = require("mongoose");

const componentSettingsSchema = new mongoose.Schema(
  {
    questions: {
      type: Number,
      min: [1, "Questions must be at least 1"],
      max: [100, "Questions cannot exceed 100"],
      default: 5,
    },
    timeLimit: {
      type: Number,
      min: [1, "Time limit must be at least 1 minute"],
      max: [480, "Time limit cannot exceed 480 minutes"],
      default: 30,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "medium",
    },
    passingScore: {
      type: Number,
      min: [0, "Passing score cannot be negative"],
      max: [100, "Passing score cannot exceed 100"],
      default: 60,
    },
  },
  { _id: false }
);

const componentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Component name is required"],
      trim: true,
      maxlength: [100, "Component name cannot exceed 100 characters"],
    },
    settings: {
      type: componentSettingsSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

const interviewConfigSchema = new mongoose.Schema(
  {
    interviewTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewType",
      required: [true, "Interview type reference is required"],
      unique: true,
    },
    components: {
      type: [componentSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: "Cannot have more than 20 components",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InterviewConfig", interviewConfigSchema);
