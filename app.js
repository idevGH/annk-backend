const express = require("express");

const memberRouter = require("./Routers/membersRoutes");
const AppError = require("./factoryFunc/errorController");

const app = express();
// Handling muti-part form data
app.use(
  express.urlencoded({
    extended: true,
  })
);
// parsing body from the request
app.use(express.json());
// serving static files
app.use(express.static("./public"));
// Setting views Engine
app.set("view engine", "pug");
app.set("views", "./views");

// Routes

app.use("/api/v1/member", memberRouter);
app.use("/member", memberRouter);

// Handling unimplemented routes
app.all("*", (req, res, next) => {
  next(new AppError(`${req.hostname}${req.originalUrl} does not exist.`, 404));
});

// Handling Errors
app.use((error, req, res, next) => {
  console.log(error.name);
  console.log(error.message);
  //Validation Error
  if (error.name === "ValidationError") {
    error.statusCode = 400;
    error.message = `Please provide ${Object.keys(error[`errors`]).join(",")}.`;
  }
  if (error.code === 11000) {
    // error.statusCode = 400;
    if (
      Object.keys(error).some((propertName) => propertName === "keyPattern")
    ) {
      error.message = `${Object.values(error.keyValue).join(
        " "
      )} is already in use.`;
    } else if (error.name === "CastError")
      error = new AppError("ANNK member doesn't exist.", 404);
    else if (error.message && error.statusCode) error;
    else {
      error = new AppError("Ooops! something went wrong.", 500);
    }
  }
  res.status(error.statusCode || 404).json({
    status: "failed",
    message: error.message,
    error,
  });
});

module.exports = app;
