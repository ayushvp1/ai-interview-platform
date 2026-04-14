const mongoose = require("mongoose");

const interviewTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Interview type name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "restricted"],
      default: "public",
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Soft-delete filter — exclude deleted records by default
interviewTypeSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

module.exports = mongoose.model("InterviewType", interviewTypeSchema);
