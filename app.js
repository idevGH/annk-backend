const express = require("express");
const cors = require("cors");
// Security packages
const limiter = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const memberRouter = require("./Routers/membersRoutes");
const AppError = require("./factoryFunc/errorController");
const scanMemberRouter = require("./Routers/scanMemberRoutes");

const app = express();
// Limiting request
app.use(
  "/member",
  limiter({
    max: 800,
    windowMs: 1000 * 10,
    message: "Too many request from this Ip address.",
  })
);
// Setting some secured headers
app.use(helmet());
// Implementing Cross origin Resource sharing
app.use(cors());
// Handling muti-part form data
app.use(
  express.urlencoded({
    extended: true,
  })
);
// parsing body from the request
app.use(express.json());
// Removing any query from forms(Used after passing the body from the request)
app.use(mongoSanitize());
//Preventing cross site scripting
app.use(xss());
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
    error = new AppError(`${Object.values(error[`errors`]).join(",")}.`, 404);
  }
  if (error.code === 11000) {
    // error.statusCode = 400;
    if (
      Object.keys(error).some((propertName) => propertName === "keyPattern")
    ) {
      error = new AppError(
        `${Object.values(error.keyValue).join(", ")} already exist.`,
        400
      );
    }
  }

  if (error.name === "CastError")
    error = new AppError("ANNK member doesn't exist.", 404);

  if (process.env.NODE_ENV === "development") {
    if (req.originalUrl.startsWith("/api")) {
      if (error.isOperational) {
        return res.status(error.statusCode || 404).json({
          status: "failed",
          message: error.message,
        });
      } else {
        return res.status(error.statusCode || 404).json({
          status: "failed",
          message: "Something went wrong",
          error,
        });
      }
    } else {
      if (error.isOperational) {
        return res
          .status(error.statusCode || 404)
          .render("errorpage", { message: error.message });
      } else {
        return res.status(error.statusCode || 404).render("errorpage", {
          message: "Something went wrong, try again later.",
        });
      }
    }
  } else if (process.env.NODE_ENV === "production") {
    if (req.originalUrl.startsWith("/api")) {
      if (error.isOperational) {
        return res.status(error.statusCode || 404).json({
          status: "failed",
          message: error.message,
        });
      } else {
        return res.status(error.statusCode || 404).json({
          status: "failed",
          message: "Something went wrong",
        });
      }
    } else {
      if (error.isOperational) {
        return res
          .status(error.statusCode || 404)
          .render("errorpage", { message: error.message });
      } else {
        return res.status(error.statusCode || 404).render("errorpage", {
          message: "Something went wrong, try again later.",
        });
      }
    }
  }
});

module.exports = app;
