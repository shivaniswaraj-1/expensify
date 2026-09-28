jest.mock("../utils/sendEmail");
jest.mock("../utils/geminiClient");

const request = require("supertest");
const moment = require("moment");
const app = require("../app");
const User = require("../models/user");
const Expense = require("../models/expense");
const MonthlyInsight = require("../models/monthlyInsight");
const AiLog = require("../models/aiLog");
const { generateSpendingInsights } = require("../utils/geminiClient");
const { connect, clearDatabase, closeDatabase } = require("./setup");

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
  jest.clearAllMocks();
});

afterAll(async () => {
  await closeDatabase();
});

async function createUserAndToken() {
  const user = await new User({
    name: "Test User",
    email: "test@example.com",
    password: "StrongP@ssw0rd!",
  }).save();
  const token = await user.generateAuthToken();
  return { user, token };
}

const validInsights = ["You spent more this month.", "Groceries is your top category.", "Keep it up!"];

describe("GET /api/ai/insights", () => {
  it("rejects a request with no token", async () => {
    const res = await request(app).get("/api/ai/insights");
    expect(res.status).toBe(401);
  });

  it("computes and caches insights for the current month on first call", async () => {
    const { user, token } = await createUserAndToken();
    await Expense.create({
      amount: 500,
      category: "Groceries & Pet Supplies",
      description: "Weekly groceries",
      userId: user._id,
      date: new Date(),
    });
    generateSpendingInsights.mockResolvedValueOnce({ json: { insights: validInsights }, tokensUsed: 80 });

    const res = await request(app).get("/api/ai/insights").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cached).toBe(false);
    expect(res.body.insights).toEqual(validInsights);
    expect(generateSpendingInsights).toHaveBeenCalledTimes(1);

    const stored = await MonthlyInsight.findOne({ userId: user._id, month: moment().format("YYYY-MM") });
    expect(stored).not.toBeNull();
    expect(stored.insights).toEqual(validInsights);

    const logs = await AiLog.find({ feature: "monthly_insights" });
    expect(logs).toHaveLength(1);
    expect(logs[0].tokensUsed).toBe(80);
  });

  it("serves the cached insights on a second call without another AI call", async () => {
    const { user, token } = await createUserAndToken();
    generateSpendingInsights.mockResolvedValueOnce({ json: { insights: validInsights }, tokensUsed: 80 });

    await request(app).get("/api/ai/insights").set("Authorization", `Bearer ${token}`);
    const second = await request(app).get("/api/ai/insights").set("Authorization", `Bearer ${token}`);

    expect(second.status).toBe(200);
    expect(second.body.cached).toBe(true);
    expect(second.body.insights).toEqual(validInsights);
    expect(generateSpendingInsights).toHaveBeenCalledTimes(1);
  });

  it("falls back to computed insights (not an error) after two failed AI attempts", async () => {
    const { user, token } = await createUserAndToken();
    await Expense.create({
      amount: 500,
      category: "Groceries & Pet Supplies",
      description: "Weekly groceries",
      userId: user._id,
      date: new Date(),
    });
    generateSpendingInsights.mockRejectedValue(new Error("Gemini is down"));

    const res = await request(app).get("/api/ai/insights").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.insights).toHaveLength(3);
    expect(res.body.insights[0]).toMatch(/500/);
    expect(generateSpendingInsights).toHaveBeenCalledTimes(2);

    const logs = await AiLog.find({ feature: "monthly_insights" });
    expect(logs[0].success).toBe(false);
  });
});
