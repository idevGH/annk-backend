const express = require("express");
const cors = require("cors");

const memberRouter = require("./Routers/membersRoutes");
const AppError = require("./factoryFunc/errorController");
const scanMemberRouter = require("./Routers/scanMemberRoutes");

const app = express();
app.use(cors());
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
app.use("/scan", scanMemberRouter);

// Handling unimplemented routes
app.all("*", (req, res, next) => {
  // next(new AppError(`${req.hostname}${req.originalUrl} does not exist.`, 404));
  next(new AppError(`The resource you are looking for does not exist.`, 404));
});

console.log(process.env.NODE_ENV);

// Handling Errors
app.use((error, req, res, next) => {
  console.log(error.name);
  console.log(error.message);
  //Validation Error
  if (error.name === "ValidationError") {
    error.statusCode = 400;
    error.message = `${Object.values(error[`errors`]).join(",")}.`;
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
  if (req.originalUrl.startsWith("/api"))
    res.status(error.statusCode || 404).json({
      status: "failed",
      message: error.message,
      error,
    });
  else
    res
      .status(error.statusCode || 404)
      .render("errorpage", { message: error.message });
});

module.exports = app;
