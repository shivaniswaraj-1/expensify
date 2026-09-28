const { z } = require("zod");
const { CATEGORIES } = require("../constants/categories");

// What we require from Gemini's response before we trust it enough to
// pre-fill the confirm form. Mirrors receiptSchema, but "note" replaces
// "merchant" since a spoken expense usually names what it was for, not a shop.
const voiceExtractionSchema = z.object({
  amount: z.coerce.number().positive(),
  date: z.coerce.date(),
  note: z.string().trim().min(1),
  category: z.enum(CATEGORIES),
  confidence: z.coerce.number().min(0).max(1),
});

// The transcript the browser's Web Speech API hands back — just needs to be
// non-empty text.
const voiceParseRequestSchema = z.object({
  transcript: z.string().trim().min(1, "No speech was captured"),
});

module.exports = { voiceExtractionSchema, voiceParseRequestSchema };
