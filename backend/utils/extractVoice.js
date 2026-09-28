const { ZodError } = require("zod");
const { extractExpenseFromVoice } = require("./geminiClient");
const { voiceExtractionSchema } = require("../schemas/voiceSchema");

const MAX_ATTEMPTS = 2;

// Calls Gemini for a voice transcript and validates the result against our
// schema, retrying once on a bad/invalid response. Returns { extracted: null }
// if every attempt fails, so the caller can fall back to an empty form.
// Mirrors extractReceiptWithRetry.
async function extractVoiceWithRetry(transcript, todayIso) {
  let tokensUsed = 0;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { json, tokensUsed: used } = await extractExpenseFromVoice(transcript, todayIso);
      tokensUsed += used ?? 0;
      const extracted = voiceExtractionSchema.parse(json);
      return { extracted, tokensUsed };
    } catch (error) {
      const reason = error instanceof ZodError ? "invalid shape" : error.message;
      console.error(`Voice extraction attempt ${attempt}/${MAX_ATTEMPTS} failed: ${reason}`);
    }
  }
  return { extracted: null, tokensUsed };
}

module.exports = { extractVoiceWithRetry };
