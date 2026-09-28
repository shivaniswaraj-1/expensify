const moment = require("moment");
const Expense = require("../models/expense");

// Pre-computes everything the insights prompt needs — this month vs last
// month, spend by category, and top merchants — so the LLM only ever sees
// small, already-correct numbers instead of raw expense rows.
async function computeMonthlyStats(userId, month) {
  const startOfMonth = moment(month, "YYYY-MM").startOf("month").toDate();
  const endOfMonth = moment(month, "YYYY-MM").endOf("month").toDate();
  const startOfLastMonth = moment(month, "YYYY-MM").subtract(1, "month").startOf("month").toDate();
  const endOfLastMonth = moment(month, "YYYY-MM").subtract(1, "month").endOf("month").toDate();

  const [thisMonthAgg, lastMonthAgg, byCategoryAgg, topMerchantsAgg] = await Promise.all([
    Expense.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Expense.aggregate([
      { $match: { userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth }, merchant: { $nin: [null, ""] } } },
      { $group: { _id: "$merchant", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 3 },
    ]),
  ]);

  return {
    month,
    thisMonthTotal: thisMonthAgg[0]?.total ?? 0,
    thisMonthCount: thisMonthAgg[0]?.count ?? 0,
    lastMonthTotal: lastMonthAgg[0]?.total ?? 0,
    byCategory: byCategoryAgg.map((c) => ({ category: c._id, total: c.total })),
    topMerchants: topMerchantsAgg.map((m) => ({ merchant: m._id, total: m.total })),
  };
}

module.exports = { computeMonthlyStats };
