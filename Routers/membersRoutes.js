const express = require("express");
const pug = require("pug");
const memberController = require("./../Controllers/memberController");
const puppeteer = require("puppeteer");
const pdf = require("pdf-creator-node");
const path = require("path");
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

// Verify number
memberRouter
  .route("/:annkId/verifyNumber")
  .get(memberController.renderVerifyPage)
  .post(memberController.verifyNumber);

memberRouter.use(memberController.protect);

//////
memberRouter.get("/print", async (req, res, next) => {
  const user = res.locals.user;

  // const html = pug.renderFile(`./views/printMemberFormTemplate.pug`, { user });
  const html = ``;
  let pdfPath = path.join("pdf", `${user.slug}.pdf`);

  let options = {
    format: "A4",
    orientation: "landscape",
    border: "10mm",
    header: {
      height: "10mm",
      contents: "<p>ANNK</p>",
    },
  };
  let document = {
    html,
    data: {},
    path: "./public/output.pdf",
  };

  const filepath = await pdf.create(document, options);

  res.sendFile(filepath.filename);
});
//////

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

memberRouter.route("/:annkId/payment").post(memberController.addPayment);
module.exports = memberRouter;
