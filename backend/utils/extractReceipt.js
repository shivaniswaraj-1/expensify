const { ZodError } = require("zod");
const { extractReceiptWithGemini } = require("./geminiClient");
const { receiptExtractionSchema } = require("../schemas/receiptSchema");

const MAX_ATTEMPTS = 2;

// Calls Gemini for a receipt image and validates the result against our
// schema, retrying once on a bad/invalid response. Returns { extracted: null }
// if every attempt fails, so the caller can fall back to an empty form.
// tokensUsed accumulates across attempts so the caller can log true call cost
// even when a retry was needed. Shared by the live /api/receipts/scan route
// and the offline accuracy-evaluation script, so both see identical retry
// behavior.
async function extractReceiptWithRetry(base64Image, mimeType) {
  let tokensUsed = 0;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { json, tokensUsed: used } = await extractReceiptWithGemini(base64Image, mimeType);
      tokensUsed += used ?? 0;
      const extracted = receiptExtractionSchema.parse(json);
      return { extracted, tokensUsed };
    } catch (error) {
      const reason = error instanceof ZodError ? "invalid shape" : error.message;
      console.error(`Receipt extraction attempt ${attempt}/${MAX_ATTEMPTS} failed: ${reason}`);
    }
  }
  return { extracted: null, tokensUsed };
}

module.exports = { extractReceiptWithRetry };
