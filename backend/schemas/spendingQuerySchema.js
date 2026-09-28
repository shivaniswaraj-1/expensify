const { z } = require("zod");
const { CATEGORIES } = require("../constants/categories");

// The request body coming from the "Ask your spending" input box.
const askSpendingRequestSchema = z.object({
  question: z.string().trim().min(1, "Ask a question first"),
});

// What we require from Gemini before trusting it enough to run a database
// query. The AI never touches Mongo directly — it only ever produces this
// small, validated filter object, which the backend then runs a normal,
// user-scoped aggregation against. If this fails to parse, the caller
// retries once and then tells the user to rephrase, rather than guessing.
const spendingFilterSchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  metric: z.enum(["sum", "count", "average"]).default("sum"),
});

module.exports = { askSpendingRequestSchema, spendingFilterSchema };
