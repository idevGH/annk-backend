const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter name of Member."],
    },
    amount: {
      type: Number,
      required: [true, "No Amount was specified for the current transaction."],
    },
    originalpaymentDate: {
      type: Date,
      default: new Date(Date.now()),
    },
    datePaid: {
      type: Date,
      default: new Date(Date.now()),
    },

    paymentType: {
      type: String,
      default: "dues",
    },
    annkId: {
      type: mongoose.Schema.ObjectId,
      ref: "Members",
      required: [true, "Include member ID."],
    },
    month: {
      type: String,
    },
    year: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
paymentSchema.pre("save", function (next) {
  this.month = Intl.DateTimeFormat("en-GH", { month: "short" }).format(
    this.datePaid
  );
  this.year = new Date(this.datePaid).getFullYear();
  next();
});

paymentSchema.virtual("payments", {
  ref: "Members",
  localField: "annkId",
  foreignField: "_id",
});

paymentSchema.index({ name: 1, month: 1, year: 1 }, { unique: true });

const paymentModel = mongoose.model("payment", paymentSchema);
paymentModel.syncIndexes();

module.exports = paymentModel;
