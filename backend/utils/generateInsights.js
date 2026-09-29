const { ZodError } = require("zod");
const { generateSpendingInsights } = require("./geminiClient");
const { insightsResponseSchema } = require("../schemas/insightsSchema");
const { sleep } = require("./sleep");
const { getRetryDelayMs } = require("./geminiRetryDelay");

const MAX_ATTEMPTS = 2;

// Calls Gemini with pre-computed stats and validates the 3-insight response,
// retrying once on a bad/invalid response. Returns { insights: null } if
// every attempt fails, so the caller can fall back to numbers-only insights
// instead of showing nothing.
async function generateInsightsWithRetry(stats) {
  let tokensUsed = 0;
  let lastErrorStatus = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { json, tokensUsed: used } = await generateSpendingInsights(stats);
      tokensUsed += used ?? 0;
      const parsed = insightsResponseSchema.parse(json);
      return { insights: parsed.insights, tokensUsed, lastErrorStatus: null };
    } catch (error) {
      lastErrorStatus = error.status ?? null;
      const reason = error instanceof ZodError ? "invalid shape" : error.message;
      console.error(`Insight generation attempt ${attempt}/${MAX_ATTEMPTS} failed: ${reason}`);
      if (attempt < MAX_ATTEMPTS) await sleep(getRetryDelayMs(error, attempt));
    }
  }
  return { insights: null, tokensUsed, lastErrorStatus };
}

// A deterministic, zero-cost fallback so a Gemini outage still shows
// something useful rather than an empty insights card.
function buildFallbackInsights(stats) {
  const change =
    stats.lastMonthTotal > 0
      ? Math.round(((stats.thisMonthTotal - stats.lastMonthTotal) / stats.lastMonthTotal) * 100)
      : null;
  const topCategory = stats.byCategory[0];

  return [
    `You've spent ₹${Math.round(stats.thisMonthTotal).toLocaleString("en-IN")} so far this month across ${stats.thisMonthCount} transaction${stats.thisMonthCount === 1 ? "" : "s"}.`,
    change === null
      ? "No spending recorded last month to compare against yet."
      : `That's ${Math.abs(change)}% ${change >= 0 ? "more" : "less"} than last month.`,
    topCategory
      ? `${topCategory.category} is your biggest category this month at ₹${Math.round(topCategory.total).toLocaleString("en-IN")}.`
      : "Add a few expenses to see a category breakdown.",
  ];
}

module.exports = { generateInsightsWithRetry, buildFallbackInsights };
