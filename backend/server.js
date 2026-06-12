require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./utils/database");
const errorhandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expense");
const premiumRoutes = require("./routes/premium");

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://expensify-xi.vercel.app",
    ],
    credentials: true,
  })
);

connectDb();

app.get("/", (req, res, next) => res.send("<h1>Hello World!<h1/>"));

//routes
app.use("/api/auth", authRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/premium", premiumRoutes);
app.use(errorhandler); //error Handler

app.listen(port, () => console.log(`Server running on PORT : ${port}`));
