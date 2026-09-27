jest.mock("../utils/sendEmail");

const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const Expense = require("../models/expense");
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

async function createUserAndToken(overrides = {}) {
  const user = await new User({
    name: "Test User",
    email: "test@example.com",
    password: "StrongP@ssw0rd!",
    ...overrides,
  }).save();
  return { user, token: user.generateAuthToken() };
}

describe("POST /api/expense", () => {
  it("creates an expense for an authenticated user", async () => {
    const { token } = await createUserAndToken();

    const res = await request(app)
      .post("/api/expense")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 100, category: "Food", description: "Lunch" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    await expect(Expense.countDocuments()).resolves.toBe(1);
  });

  it("rejects a request with no token", async () => {
    const res = await request(app)
      .post("/api/expense")
      .send({ amount: 100, category: "Food", description: "Lunch" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects a malformed/invalid token", async () => {
    const res = await request(app)
      .post("/api/expense")
      .set("Authorization", "Bearer not-a-real-token")
      .send({ amount: 100, category: "Food", description: "Lunch" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects invalid input (missing required fields)", async () => {
    const { token } = await createUserAndToken();

    const res = await request(app)
      .post("/api/expense")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 100 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/expense", () => {
  it("returns a paginated page of the user's expenses", async () => {
    const { user, token } = await createUserAndToken();

    const expenses = Array.from({ length: 15 }, (_, i) => ({
      amount: i + 1,
      category: "Food",
      description: `Expense ${i + 1}`,
      userId: user._id,
    }));
    await Expense.insertMany(expenses);

    const res = await request(app)
      .get("/api/expense")
      .query({ page: 2, rows: 10 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.currentPage).toBe(2);
    expect(res.body.totalItems).toBe(15);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.expenses).toHaveLength(5);
  });

  it("only returns expenses belonging to the requesting user", async () => {
    const { user, token } = await createUserAndToken();
    const otherUser = await new User({
      name: "Other User",
      email: "other@example.com",
      password: "StrongP@ssw0rd!",
    }).save();

    await Expense.create({
      amount: 50,
      category: "Food",
      description: "Mine",
      userId: user._id,
    });
    await Expense.create({
      amount: 999,
      category: "Food",
      description: "Not mine",
      userId: otherUser._id,
    });

    const res = await request(app)
      .get("/api/expense")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalItems).toBe(1);
    expect(res.body.expenses[0].description).toBe("Mine");
  });

  it("rejects a request with no token", async () => {
    const res = await request(app).get("/api/expense");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
