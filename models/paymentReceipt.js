const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "No Amount was specified for the current transaction."],
    },
    month: {
      type: String,
      required: [true, "No Month was specified for the current transaction."],
    },
    datePaid: {
      type: Date,
      default: new Date(Date.now()),
    },
    annkId: {
      type: mongoose.Schema.ObjectId,
      ref: "Members",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

paymentSchema.virtual("payments", {
  ref: "Members",
  localField: "annkId",
  foreignField: "_id",
});

paymentSchema.index({ name: 1, amount: 1, month: 1 }, { unique: true });

const paymentModel = mongoose.model("payment", paymentSchema);
paymentModel.syncIndexes();

module.exports = paymentModel;
