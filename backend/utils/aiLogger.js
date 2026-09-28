const AiLog = require("../models/aiLog");

// Fire-and-forget: writing the audit-trail row must never break the actual
// AI feature it's logging, so failures here are swallowed (just logged to
// the console) rather than propagated.
async function logAiCall({ feature, userId, tokensUsed, responseTimeMs, success, errorMessage }) {
  try {
    await AiLog.create({ feature, userId, tokensUsed, responseTimeMs, success, errorMessage });
  } catch (error) {
    console.error(`Failed to write ai_logs entry for ${feature}:`, error.message);
  }
}

module.exports = { logAiCall };
