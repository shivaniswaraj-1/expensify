jest.mock("../utils/sendEmail");

const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const AiLog = require("../models/aiLog");
const { connect, clearDatabase, closeDatabase } = require("./setup");

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
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
  return { user, token: await user.generateAuthToken() };
}

describe("GET /api/ai/admin/stats", () => {
  it("rejects a request with no token", async () => {
    const res = await request(app).get("/api/ai/admin/stats");
    expect(res.status).toBe(401);
  });

  it("aggregates count, success rate, avg tokens and avg response time per feature", async () => {
    const { user, token } = await createUserAndToken();

    await AiLog.create([
      { feature: "receipt_scan", userId: user._id, tokensUsed: 100, responseTimeMs: 800, success: true },
      { feature: "receipt_scan", userId: user._id, tokensUsed: 200, responseTimeMs: 1200, success: false },
      { feature: "ask_spending", userId: user._id, tokensUsed: 50, responseTimeMs: 400, success: true },
    ]);

    const res = await request(app).get("/api/ai/admin/stats").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const receiptStats = res.body.stats.find((s) => s.feature === "receipt_scan");
    expect(receiptStats.count).toBe(2);
    expect(receiptStats.successRate).toBe(0.5);
    expect(receiptStats.avgTokens).toBe(150);
    expect(receiptStats.avgResponseTimeMs).toBe(1000);

    const askStats = res.body.stats.find((s) => s.feature === "ask_spending");
    expect(askStats.count).toBe(1);
    expect(askStats.successRate).toBe(1);
  });

  it("returns an empty list when no AI calls have been logged", async () => {
    const { token } = await createUserAndToken();
    const res = await request(app).get("/api/ai/admin/stats").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.stats).toEqual([]);
  });
});
