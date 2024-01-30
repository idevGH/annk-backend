const express = require("express");
const memberController = require("./../Controllers/memberController");

// Creating Router for the member route
const memberRouter = express.Router();

memberRouter.get("/logout", memberController.logout);
memberRouter
  .route("/login")
  .get(memberController.renderLoginPage)
  .post(memberController.login);

memberRouter.use(memberController.protect);
memberRouter
  .route("/")
  .post(
    memberController.uploadSingleImage,
    memberController.imageManipulate,
    memberController.addMember
  );

memberRouter.route("/:annkId/editDetails").get(memberController.renderEditpage);
memberRouter
  .route("/:annkId")
  .get(memberController.viewProfile)
  .patch(
    memberController.uploadSingleImage,
    memberController.imageManipulate,
    memberController.updateprofile
  );

memberRouter
  .route("/:annkId/updatePassword")
  .post(memberController.updatePassword);
module.exports = memberRouter;
