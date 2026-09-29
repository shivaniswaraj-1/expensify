const { ZodError } = require("zod");
const { parseSpendingQuestion } = require("./geminiClient");
const { spendingFilterSchema } = require("../schemas/spendingQuerySchema");
const { sleep } = require("./sleep");
const { getRetryDelayMs } = require("./geminiRetryDelay");

const MAX_ATTEMPTS = 2;

// Calls Gemini to turn a free-text spending question into a filter object,
// then validates it against our schema before it's ever used to build a
// database query. Retries once on a bad/invalid response, then gives up so
// the caller can ask the user to rephrase. Mirrors extractReceiptWithRetry.
async function extractSpendingFilterWithRetry(question, todayIso) {
  let tokensUsed = 0;
  let lastErrorStatus = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { json, tokensUsed: used } = await parseSpendingQuestion(question, todayIso);
      tokensUsed += used ?? 0;
      const filter = spendingFilterSchema.parse(json);
      return { filter, tokensUsed, lastErrorStatus: null };
    } catch (error) {
      lastErrorStatus = error.status ?? null;
      const reason = error instanceof ZodError ? "invalid shape" : error.message;
      console.error(`Spending-filter extraction attempt ${attempt}/${MAX_ATTEMPTS} failed: ${reason}`);
      if (attempt < MAX_ATTEMPTS) await sleep(getRetryDelayMs(error, attempt));
    }
  }
  return { filter: null, tokensUsed, lastErrorStatus };
}

module.exports = { extractSpendingFilterWithRetry };
