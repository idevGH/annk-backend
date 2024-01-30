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
mongoose.connect("mongodb://127.0.0.1:27017/Annk");

// starting server
app.listen(8090, "127.0.0.1", () => {
  console.log("Listening on port 8090....");
});

process.on("unhandledRejection", (err) => {
  if (err.name === "MongooseServerSelectionError")
    err.message = `Error connecting to database.`;
  console.log(err.name, err.message, "********");
});
