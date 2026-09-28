const mongoose = require("mongoose");

// One row per Gemini call, across every AI feature — lets a cost/speed
// admin view answer "which feature is expensive/slow/flaky" from real data
// instead of guesswork.
const AiLogSchema = new mongoose.Schema(
  {
    feature: {
      type: String,
      required: true,
      enum: ["receipt_scan", "voice_parse", "ask_spending", "monthly_insights"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tokensUsed: {
      type: Number,
    },
    responseTimeMs: {
      type: Number,
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    errorMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

AiLogSchema.index({ feature: 1, createdAt: -1 });

const AiLog = mongoose.model("AiLog", AiLogSchema);

module.exports = AiLog;
