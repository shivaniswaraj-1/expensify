const asyncHandler = require("express-async-handler");
const moment = require("moment");
const Expense = require("../models/expense");
const { extractSpendingFilterWithRetry } = require("../utils/extractSpendingFilter");
const { formatSpendingAnswer } = require("../utils/formatSpendingAnswer");
const { logAiCall } = require("../utils/aiLogger");

// "Ask your spending": the LLM only ever converts a question into a small,
// Zod-validated filter object. The actual numbers always come from a
// MongoDB aggregation that this backend runs itself, scoped to the logged-in
// user — the AI never sees, and can't touch, anyone's raw data.
const askSpending = asyncHandler(async (req, res) => {
  const { question } = req.body;
  const todayIso = moment().format("YYYY-MM-DD");

  const startedAt = Date.now();
  const { filter, tokensUsed } = await extractSpendingFilterWithRetry(question, todayIso);
  logAiCall({
    feature: "ask_spending",
    userId: req.user._id,
    tokensUsed,
    responseTimeMs: Date.now() - startedAt,
    success: !!filter,
  });

  if (!filter) {
    return res.status(200).json({
      success: false,
      message: "Couldn't understand that question, please try rephrasing it.",
    });
  }

  const match = { userId: req.user._id };
  if (filter.category) {
    match.category = filter.category;
  }
  if (filter.from || filter.to) {
    match.date = {};
    if (filter.from) match.date.$gte = filter.from;
    if (filter.to) match.date.$lte = filter.to;
  }

  const [aggregate] = await Expense.aggregate([
    { $match: match },
    { $group: { _id: null, sum: { $sum: "$amount" }, count: { $sum: 1 }, average: { $avg: "$amount" } } },
  ]);
  const result = aggregate ?? { sum: 0, count: 0, average: 0 };
  const value = result[filter.metric] ?? 0;

  res.status(200).json({
    success: true,
    answer: formatSpendingAnswer(filter, value),
    filter,
    value,
  });
});

module.exports = { askSpending };
