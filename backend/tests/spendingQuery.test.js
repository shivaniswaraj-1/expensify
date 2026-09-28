jest.mock("../utils/sendEmail");
jest.mock("../utils/geminiClient");

const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const Expense = require("../models/expense");
const AiLog = require("../models/aiLog");
const { parseSpendingQuestion } = require("../utils/geminiClient");
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

describe("POST /api/ai/ask", () => {
  it("rejects a request with no token", async () => {
    const res = await request(app).post("/api/ai/ask").send({ question: "How much on food?" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects an empty question", async () => {
    const { token } = await createUserAndToken();

    const res = await request(app)
      .post("/api/ai/ask")
      .set("Authorization", `Bearer ${token}`)
      .send({ question: "" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(parseSpendingQuestion).not.toHaveBeenCalled();
  });

  it("only aggregates the requesting user's own expenses", async () => {
    const { user, token } = await createUserAndToken();
    const otherUser = await new User({
      name: "Other User",
      email: "other@example.com",
      password: "StrongP@ssw0rd!",
    }).save();

    await Expense.create([
      { amount: 100, category: "Entertainment", description: "Movie", userId: user._id },
      { amount: 500, category: "Entertainment", description: "Concert", userId: otherUser._id },
    ]);

    parseSpendingQuestion.mockResolvedValueOnce({
      json: { category: "Entertainment", metric: "sum" },
      tokensUsed: 55,
    });

    const res = await request(app)
      .post("/api/ai/ask")
      .set("Authorization", `Bearer ${token}`)
      .send({ question: "How much did I spend on entertainment?" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.value).toBe(100);
    expect(res.body.answer).toMatch(/100/);

    const logs = await AiLog.find({ feature: "ask_spending" });
    expect(logs).toHaveLength(1);
    expect(logs[0].success).toBe(true);
    expect(logs[0].tokensUsed).toBe(55);
  });

  it("returns count and average correctly for the requested metric", async () => {
    const { user, token } = await createUserAndToken();
    await Expense.create([
      { amount: 100, category: "Entertainment", description: "A", userId: user._id },
      { amount: 300, category: "Entertainment", description: "B", userId: user._id },
    ]);

    parseSpendingQuestion.mockResolvedValueOnce({
      json: { category: "Entertainment", metric: "average" },
      tokensUsed: 10,
    });

    const res = await request(app)
      .post("/api/ai/ask")
      .set("Authorization", `Bearer ${token}`)
      .send({ question: "What's my average spend on entertainment?" });

    expect(res.status).toBe(200);
    expect(res.body.value).toBe(200);
  });

  it("retries once on a bad response before succeeding", async () => {
    const { token } = await createUserAndToken();
    parseSpendingQuestion
      .mockResolvedValueOnce({ json: { metric: "not-a-metric" }, tokensUsed: 5 })
      .mockResolvedValueOnce({ json: { metric: "sum" }, tokensUsed: 20 });

    const res = await request(app)
      .post("/api/ai/ask")
      .set("Authorization", `Bearer ${token}`)
      .send({ question: "How much have I spent?" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(parseSpendingQuestion).toHaveBeenCalledTimes(2);
  });

  it("asks the user to rephrase after two failed attempts", async () => {
    const { token } = await createUserAndToken();
    parseSpendingQuestion.mockRejectedValue(new Error("Gemini is down"));

    const res = await request(app)
      .post("/api/ai/ask")
      .set("Authorization", `Bearer ${token}`)
      .send({ question: "gibberish question" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/rephrasing/i);

    const logs = await AiLog.find({ feature: "ask_spending" });
    expect(logs[0].success).toBe(false);
  });
});
