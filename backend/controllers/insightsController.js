const asyncHandler = require("express-async-handler");
const moment = require("moment");
const MonthlyInsight = require("../models/monthlyInsight");
const { computeMonthlyStats } = require("../utils/monthlyStats");
const { generateInsightsWithRetry, buildFallbackInsights } = require("../utils/generateInsights");
const { logAiCall } = require("../utils/aiLogger");

// Returns 3 short insights for the current calendar month, cached per user
// per month so revisiting the dashboard doesn't trigger another paid call.
const getMonthlyInsights = asyncHandler(async (req, res) => {
  const month = moment().format("YYYY-MM");

  const cached = await MonthlyInsight.findOne({ userId: req.user._id, month });
  if (cached) {
    return res.status(200).json({ success: true, insights: cached.insights, month, cached: true });
  }

  const stats = await computeMonthlyStats(req.user._id, month);

  const startedAt = Date.now();
  const { insights: generated, tokensUsed } = await generateInsightsWithRetry(stats);
  logAiCall({
    feature: "monthly_insights",
    userId: req.user._id,
    tokensUsed,
    responseTimeMs: Date.now() - startedAt,
    success: !!generated,
  });

  const insights = generated ?? buildFallbackInsights(stats);

  await MonthlyInsight.findOneAndUpdate(
    { userId: req.user._id, month },
    { insights },
    { upsert: true }
  );

  res.status(200).json({ success: true, insights, month, cached: false });
});

module.exports = { getMonthlyInsights };
