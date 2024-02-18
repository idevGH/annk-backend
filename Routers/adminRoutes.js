const express = require("express");
const memberRouter = require("./membersRoutes");
const adminController = require("./../Controllers/adminController");

const adminRouter = express.Router();

adminRouter
  .route("/login")
  .post(adminController.login)
  .get(adminController.renderLogin);
adminRouter.route("/").post(adminController.newAdmin);

adminRouter.use(adminController.protect);
adminRouter.use("/:adminId/member", memberRouter);
adminRouter.route("/:adminId").get(adminController.viewProfile);

module.exports = adminRouter;
