jest.mock("../utils/sendEmail");

const request = require("supertest");
const moment = require("moment");
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

describe("GET /api/premium/report", () => {
  it("excludes an expense whose date falls outside the window, even though createdAt is always 'now'", async () => {
    const { user, token } = await createUserAndToken();
    // date is 2 years ago; createdAt is set to "now" by the schema default.
    // If the report still filtered by createdAt this would wrongly appear
    // in a "weekly" report.
    await Expense.create({
      amount: 500,
      category: "Entertainment",
      description: "Backdated expense",
      date: moment().subtract(2, "years").toDate(),
      userId: user._id,
    });

    const res = await request(app)
      .get("/api/premium/report")
      .query({ type: "weekly" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("includes an expense whose date falls inside the window", async () => {
    const { user, token } = await createUserAndToken();
    await Expense.create({
      amount: 300,
      category: "Entertainment",
      description: "Recent",
      date: moment().subtract(1, "day").toDate(),
      userId: user._id,
    });

    const res = await request(app)
      .get("/api/premium/report")
      .query({ type: "weekly" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const total = res.body.reduce((sum, bucket) => sum + bucket.amount, 0);
    expect(total).toBe(300);
  });
});
