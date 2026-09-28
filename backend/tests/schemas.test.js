// Pure unit tests for the Zod schemas that gate every AI response before
// it's trusted — no DB or HTTP involved, just the parsing logic itself.
const { receiptExtractionSchema } = require("../schemas/receiptSchema");
const { voiceExtractionSchema } = require("../schemas/voiceSchema");
const { spendingFilterSchema, askSpendingRequestSchema } = require("../schemas/spendingQuerySchema");
const { insightsResponseSchema } = require("../schemas/insightsSchema");

describe("receiptExtractionSchema", () => {
  it("accepts a well-formed extraction", () => {
    const result = receiptExtractionSchema.safeParse({
      amount: 42.5,
      date: "2024-03-05",
      merchant: "Corner Cafe",
      category: "Entertainment",
      confidence: 0.9,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-positive amount", () => {
    const result = receiptExtractionSchema.safeParse({
      amount: 0,
      date: "2024-03-05",
      merchant: "Corner Cafe",
      category: "Entertainment",
      confidence: 0.9,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a category outside the fixed list", () => {
    const result = receiptExtractionSchema.safeParse({
      amount: 10,
      date: "2024-03-05",
      merchant: "Corner Cafe",
      category: "Made Up Category",
      confidence: 0.9,
    });
    expect(result.success).toBe(false);
  });
});

describe("voiceExtractionSchema", () => {
  it("accepts a well-formed extraction", () => {
    const result = voiceExtractionSchema.safeParse({
      amount: 200,
      date: "2024-03-05",
      note: "Auto rickshaw",
      category: "Sports, Outdoor & Travel",
      confidence: 0.8,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty note", () => {
    const result = voiceExtractionSchema.safeParse({
      amount: 200,
      date: "2024-03-05",
      note: "   ",
      category: "Sports, Outdoor & Travel",
      confidence: 0.8,
    });
    expect(result.success).toBe(false);
  });

  it("coerces a numeric string amount", () => {
    const result = voiceExtractionSchema.safeParse({
      amount: "200",
      date: "2024-03-05",
      note: "Auto rickshaw",
      category: "Sports, Outdoor & Travel",
      confidence: 0.8,
    });
    expect(result.success).toBe(true);
    expect(result.data.amount).toBe(200);
  });
});

describe("askSpendingRequestSchema", () => {
  it("rejects an empty question", () => {
    expect(askSpendingRequestSchema.safeParse({ question: "" }).success).toBe(false);
  });

  it("accepts a non-empty question", () => {
    expect(askSpendingRequestSchema.safeParse({ question: "How much on food?" }).success).toBe(true);
  });
});

describe("spendingFilterSchema", () => {
  it("defaults metric to sum when omitted", () => {
    const result = spendingFilterSchema.safeParse({ category: "Entertainment" });
    expect(result.success).toBe(true);
    expect(result.data.metric).toBe("sum");
  });

  it("accepts a filter with a date range and explicit metric", () => {
    const result = spendingFilterSchema.safeParse({
      category: "Groceries & Pet Supplies",
      from: "2026-08-01",
      to: "2026-08-31",
      metric: "count",
    });
    expect(result.success).toBe(true);
    expect(result.data.from).toBeInstanceOf(Date);
  });

  it("rejects a category outside the fixed list", () => {
    const result = spendingFilterSchema.safeParse({ category: "Food" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown metric", () => {
    const result = spendingFilterSchema.safeParse({ metric: "median" });
    expect(result.success).toBe(false);
  });

  it("accepts an empty filter (a plain 'how much have I spent overall' question)", () => {
    const result = spendingFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("insightsResponseSchema", () => {
  it("accepts exactly 3 non-empty insights", () => {
    const result = insightsResponseSchema.safeParse({
      insights: ["First insight.", "Second insight.", "Third insight."],
    });
    expect(result.success).toBe(true);
  });

  it("rejects fewer than 3 insights", () => {
    const result = insightsResponseSchema.safeParse({ insights: ["Only one."] });
    expect(result.success).toBe(false);
  });

  it("rejects an empty-string insight", () => {
    const result = insightsResponseSchema.safeParse({
      insights: ["First insight.", "", "Third insight."],
    });
    expect(result.success).toBe(false);
  });
});
