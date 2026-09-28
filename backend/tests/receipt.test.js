jest.mock("../utils/sendEmail");
jest.mock("../utils/geminiClient");
jest.mock("../utils/upload");

const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const { extractReceiptWithGemini } = require("../utils/geminiClient");
const { uploadImageToCloudinary } = require("../utils/upload");
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
  amount: 42.5,
  date: "2024-03-05",
  merchant: "Corner Cafe",
  category: "Entertainment",
  confidence: 0.92,
};

describe("POST /api/receipts/scan", () => {
  it("rejects a request with no token", async () => {
    const res = await request(app)
      .post("/api/receipts/scan")
      .attach("receipt", Buffer.from("fake-image"), {
        filename: "receipt.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects a request with no file attached", async () => {
    const token = await createUserAndToken();

    const res = await request(app)
      .post("/api/receipts/scan")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects a non-image file", async () => {
    const token = await createUserAndToken();

    const res = await request(app)
      .post("/api/receipts/scan")
      .set("Authorization", `Bearer ${token}`)
      .attach("receipt", Buffer.from("not an image"), {
        filename: "receipt.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(extractReceiptWithGemini).not.toHaveBeenCalled();
  });

  it("rejects a file over the 5MB limit", async () => {
    const token = await createUserAndToken();
    const oversized = Buffer.alloc(6 * 1024 * 1024);

    const res = await request(app)
      .post("/api/receipts/scan")
      .set("Authorization", `Bearer ${token}`)
      .attach("receipt", oversized, {
        filename: "receipt.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  }, 15000);

  it("returns the extracted fields and a receipt URL on success", async () => {
    const token = await createUserAndToken();
    extractReceiptWithGemini.mockResolvedValueOnce({ json: validExtraction, tokensUsed: 120 });

    const res = await request(app)
      .post("/api/receipts/scan")
      .set("Authorization", `Bearer ${token}`)
      .attach("receipt", Buffer.from("fake-image"), {
        filename: "receipt.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.extracted.merchant).toBe("Corner Cafe");
    expect(res.body.extracted.category).toBe("Entertainment");
    expect(res.body.receiptUrl).toEqual(expect.any(String));
    expect(extractReceiptWithGemini).toHaveBeenCalledTimes(1);
    expect(uploadImageToCloudinary).toHaveBeenCalledTimes(1);
  });

  it("retries once on a bad response before succeeding", async () => {
    const token = await createUserAndToken();
    extractReceiptWithGemini
      .mockResolvedValueOnce({ json: { amount: "not-a-number" }, tokensUsed: 40 })
      .mockResolvedValueOnce({ json: validExtraction, tokensUsed: 120 });

    const res = await request(app)
      .post("/api/receipts/scan")
      .set("Authorization", `Bearer ${token}`)
      .attach("receipt", Buffer.from("fake-image"), {
        filename: "receipt.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(extractReceiptWithGemini).toHaveBeenCalledTimes(2);
  });

  it("falls back to an empty form after two failed attempts", async () => {
    const token = await createUserAndToken();
    extractReceiptWithGemini.mockRejectedValue(new Error("Gemini is down"));

    const res = await request(app)
      .post("/api/receipts/scan")
      .set("Authorization", `Bearer ${token}`)
      .attach("receipt", Buffer.from("fake-image"), {
        filename: "receipt.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/couldn't read this receipt/i);
    // The photo is still uploaded even though extraction failed.
    expect(res.body.receiptUrl).toEqual(expect.any(String));
    expect(extractReceiptWithGemini).toHaveBeenCalledTimes(2);
  });
});
