const mongoose = require("mongoose");

// One cached row per user per calendar month, so a page revisit within the
// same month doesn't trigger another paid Gemini call.
const MonthlyInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: String, // "YYYY-MM"
      required: true,
    },
    insights: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

MonthlyInsightSchema.index({ userId: 1, month: 1 }, { unique: true });

const MonthlyInsight = mongoose.model("MonthlyInsight", MonthlyInsightSchema);

module.exports = MonthlyInsight;
