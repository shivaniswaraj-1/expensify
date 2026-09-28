const express = require("express");
const cors = require("cors");
const errorhandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expense");
const premiumRoutes = require("./routes/premium");
const receiptRoutes = require("./routes/receipt");
const voiceRoutes = require("./routes/voice");
const aiRoutes = require("./routes/ai");

const app = express();

// Render/Vercel sit behind a reverse proxy; without this express-rate-limit
// can't tell real client IPs apart from the proxy's.
app.set("trust proxy", 1);

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://expensify-xi.vercel.app",
      "https://spendwise-xi.vercel.app",
    ],
  })
);
app.use(apiLimiter);

app.get("/", (req, res, next) => res.send("<h1>Hello World!<h1/>"));

//routes
app.use("/api/auth", authRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/ai", aiRoutes);

app.use((req, res, next) => {
  res.status(404);
  next(new Error("Route not found"));
});

app.use(errorhandler); //error Handler

module.exports = app;
