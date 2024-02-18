const express = require("express");
const paymentController = require("./../Controllers/paymentsController");

const paymentRouter = express.Router();

paymentRouter.route("/").post(paymentController.addPayment);

module.exports = paymentRouter;
