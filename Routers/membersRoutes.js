const express = require("express");
const memberController = require("./../Controllers/memberController");

// Creating Router for the member route
const memberRouter = express.Router();

memberRouter.get("/logout", memberController.logout);
memberRouter
  .route("/login")
  .get(memberController.renderLoginPage)
  .post(memberController.login);

memberRouter.route("/").get((req, res, next) => {
  res.status(200).render("registerMember");
});

memberRouter
  .route("/register")
  .post(
    memberController.uploadSingleImage,
    memberController.imageManipulate,
    memberController.addMember
  );
// pay Dues route
memberRouter.route("/:annkId/paydues").post(memberController.payDues);

memberRouter.use(memberController.protect);

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
  .route("/:annkId/verifyNumber")
  .get(memberController.renderVerifyPage)
  .post(memberController.verifyNumber);

memberRouter
  .route("/:annkId/updatePassword")
  .post(memberController.updatePassword);

module.exports = memberRouter;
