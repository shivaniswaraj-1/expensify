jest.mock("../utils/sendEmail");

const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
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

const credentials = {
  name: "Test User",
  email: "test@example.com",
  password: "StrongP@ssw0rd!",
};

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await new User(credentials).save();
  });

  it("logs in with correct credentials and returns a token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: credentials.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe("string");
  });

  it("rejects an incorrect password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "WrongPassword123!" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: "Invalid Credentials!",
    });
  });

  it("rejects a login with missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 for an email that isn't registered", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "whatever123!" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
