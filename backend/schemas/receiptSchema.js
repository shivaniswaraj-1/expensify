const { z } = require("zod");
const { CATEGORIES } = require("../constants/categories");

// What we require from Gemini's response before we trust it enough to
// pre-fill the confirm form. If this fails to parse, the caller retries once
// and then falls back to an empty form rather than showing garbage.
const receiptExtractionSchema = z.object({
  amount: z.coerce.number().positive(),
  date: z.coerce.date(),
  merchant: z.string().trim().min(1),
  category: z.enum(CATEGORIES),
  confidence: z.coerce.number().min(0).max(1),
});

module.exports = { receiptExtractionSchema };
