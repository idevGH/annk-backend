const express = require("express");
const scanController = require("./../Controllers/scanController");

const scanRouter = express.Router();

scanRouter.get("/:annkId", scanController.getScannedMember);

module.exports = scanRouter;
