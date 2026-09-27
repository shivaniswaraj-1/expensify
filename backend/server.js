require("dotenv").config();
const app = require("./app");
const connectDb = require("./utils/database");

const port = process.env.PORT || 8080;

connectDb();

app.listen(port, () => console.log(`Server running on PORT : ${port}`));
