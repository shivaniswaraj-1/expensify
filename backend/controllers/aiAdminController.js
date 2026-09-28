const asyncHandler = require("express-async-handler");
const AiLog = require("../models/aiLog");

// Aggregated cost/speed numbers per AI feature — call count, success rate,
// average tokens, average response time. Read-only, no per-user financial
// data, so any logged-in user can view it in this demo app; gate this
// behind a real admin role before shipping it to production.
const getAiStats = asyncHandler(async (req, res) => {
  const rows = await AiLog.aggregate([
    {
      $group: {
        _id: "$feature",
        count: { $sum: 1 },
        successCount: { $sum: { $cond: ["$success", 1, 0] } },
        avgTokens: { $avg: "$tokensUsed" },
        avgResponseTimeMs: { $avg: "$responseTimeMs" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const stats = rows.map((row) => ({
    feature: row._id,
    count: row.count,
    successRate: row.count > 0 ? row.successCount / row.count : 0,
    avgTokens: row.avgTokens != null ? Math.round(row.avgTokens) : null,
    avgResponseTimeMs: row.avgResponseTimeMs != null ? Math.round(row.avgResponseTimeMs) : null,
  }));

  res.status(200).json({ success: true, stats });
});

module.exports = { getAiStats };
