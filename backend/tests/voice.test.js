jest.mock("../utils/sendEmail");
jest.mock("../utils/geminiClient");

const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const { extractExpenseFromVoice } = require("../utils/geminiClient");
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
  return user.generateAuthToken();
}

const validExtraction = {
  amount: 200,
  date: "2024-03-05",
  note: "Auto rickshaw",
  category: "Sports, Outdoor & Travel",
  confidence: 0.88,
};

describe("POST /api/voice/parse", () => {
  it("rejects a request with no token", async () => {
    const res = await request(app)
      .post("/api/voice/parse")
      .send({ transcript: "kal do sau rupaye auto mein kharch hue" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects a request with an empty transcript", async () => {
    const token = await createUserAndToken();

    const res = await request(app)
      .post("/api/voice/parse")
      .set("Authorization", `Bearer ${token}`)
      .send({ transcript: "" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(extractExpenseFromVoice).not.toHaveBeenCalled();
  });

  it("returns the extracted fields on success", async () => {
    const token = await createUserAndToken();
    extractExpenseFromVoice.mockResolvedValueOnce({ json: validExtraction, tokensUsed: 95 });

    const res = await request(app)
      .post("/api/voice/parse")
      .set("Authorization", `Bearer ${token}`)
      .send({ transcript: "kal do sau rupaye auto mein kharch hue" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.extracted.note).toBe("Auto rickshaw");
    expect(res.body.extracted.amount).toBe(200);
    expect(res.body.extracted.category).toBe("Sports, Outdoor & Travel");
    expect(extractExpenseFromVoice).toHaveBeenCalledTimes(1);
    expect(extractExpenseFromVoice.mock.calls[0][0]).toBe("kal do sau rupaye auto mein kharch hue");
  });

  it("retries once on a bad response before succeeding", async () => {
    const token = await createUserAndToken();
    extractExpenseFromVoice
      .mockResolvedValueOnce({ json: { amount: "not-a-number" }, tokensUsed: 30 })
      .mockResolvedValueOnce({ json: validExtraction, tokensUsed: 95 });

    const res = await request(app)
      .post("/api/voice/parse")
      .set("Authorization", `Bearer ${token}`)
      .send({ transcript: "do sau rupaye" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(extractExpenseFromVoice).toHaveBeenCalledTimes(2);
  });

  it("falls back to an empty form after two failed attempts", async () => {
    const token = await createUserAndToken();
    extractExpenseFromVoice.mockRejectedValue(new Error("Gemini is down"));

    const res = await request(app)
      .post("/api/voice/parse")
      .set("Authorization", `Bearer ${token}`)
      .send({ transcript: "do sau rupaye" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/couldn't understand that/i);
    expect(extractExpenseFromVoice).toHaveBeenCalledTimes(2);
  });
});
