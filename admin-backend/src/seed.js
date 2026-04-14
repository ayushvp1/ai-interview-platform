/**
 * Seed script — populates MongoDB with the 3 default interview types
 * that match the existing Next.js frontend (Technical, HR, Managerial).
 *
 * Usage:  npm run seed
 */
require("dotenv").config();
const mongoose = require("mongoose");
const InterviewType = require("./models/InterviewType");
const InterviewConfig = require("./models/InterviewConfig");

const SEED_TYPES = [
  {
    name: "Technical",
    description: "Evaluates coding skills, system design, and technical problem-solving.",
    enabled: true,
    visibility: "public",
    prerequisites: [],
  },
  {
    name: "HR",
    description: "Assesses cultural fit, communication, and behavioural competencies.",
    enabled: true,
    visibility: "public",
    prerequisites: [],
  },
  {
    name: "Managerial",
    description: "Tests leadership, strategic thinking, and team management capabilities.",
    enabled: true,
    visibility: "public",
    prerequisites: ["Technical", "HR"],
  },
];

const DEFAULT_COMPONENTS = {
  Technical: [
    {
      name: "Coding Assessment",
      settings: { questions: 5, timeLimit: 45, difficulty: "medium", passingScore: 70 },
    },
    {
      name: "System Design",
      settings: { questions: 2, timeLimit: 30, difficulty: "hard", passingScore: 65 },
    },
  ],
  HR: [
    {
      name: "Behavioural Questions",
      settings: { questions: 5, timeLimit: 30, difficulty: "easy", passingScore: 60 },
    },
    {
      name: "Situational Judgement",
      settings: { questions: 3, timeLimit: 20, difficulty: "medium", passingScore: 60 },
    },
  ],
  Managerial: [
    {
      name: "Leadership Scenarios",
      settings: { questions: 4, timeLimit: 30, difficulty: "hard", passingScore: 65 },
    },
    {
      name: "Strategic Thinking",
      settings: { questions: 3, timeLimit: 25, difficulty: "hard", passingScore: 65 },
    },
  ],
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    for (const typeData of SEED_TYPES) {
      // Use updateOne to allow re-running the seed safely
      const result = await InterviewType.collection.updateOne(
        { name: typeData.name, deletedAt: null },
        { $setOnInsert: { ...typeData, createdAt: new Date(), updatedAt: new Date(), deletedAt: null } },
        { upsert: true }
      );

      const doc = await InterviewType.collection.findOne({ name: typeData.name, deletedAt: null });

      if (result.upsertedCount > 0) {
        console.log(`  ✔ Created interview type: ${typeData.name}`);
      } else {
        console.log(`  ⊙ Already exists: ${typeData.name}`);
      }

      // Upsert matching config
      const components = DEFAULT_COMPONENTS[typeData.name] || [];
      const configResult = await InterviewConfig.collection.updateOne(
        { interviewTypeId: doc._id },
        {
          $setOnInsert: {
            interviewTypeId: doc._id,
            components,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );

      if (configResult.upsertedCount > 0) {
        console.log(`    ↳ Config seeded with ${components.length} component(s)`);
      } else {
        console.log(`    ↳ Config already exists`);
      }
    }

    console.log("\n🎉 Seed complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
