process.on("uncaughtException", (err) => {
  console.log(err);
});
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
//Custom imports
const app = require("./app");
// Inbuilt modules
const { promisify } = require("util");

// 3rd party modules
const mongoose = require("mongoose");

// Connecting to Database
let mongoUrl = `mongodb+srv://<name>:<password>@cluster0.brqvsbt.mongodb.net/?retryWrites=true`;
if (process.env.NODE_ENV === "development") mongoUrl = process.env.LOCALDB_URL;
if (process.env.NODE_ENV === "production")
  mongoUrl = mongoUrl
    .replace("<password>", process.env.DB_PASSWORD)
    .replace("name", process.env.DB_NAME);

mongoose.connect(mongoUrl);

// starting server
app.listen(process.env.PORT || 8090, "127.0.0.1", () => {
  console.log("Listening on port 8090....");
});

process.on("unhandledRejection", (err) => {
  if (err.name === "MongooseServerSelectionError")
    err.message = `Error connecting to database.`;
  console.log(err.name, err.message, "From unhandledRejection");
});
