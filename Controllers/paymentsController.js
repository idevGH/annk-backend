const paymentModel = require("./../models/paymentReceipt");
exports.addPayment = async function (req, res, next) {
  try {
    const { body } = req;
    const receipt = await paymentModel.create(body);

    res.status(200).json({
      status: "success",
      message: "Payment added sucessfully.",
      data: {
        receipt,
      },
    });
  } catch (err) {
    // console.log(err);
    next(err);
  }
};
