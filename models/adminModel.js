const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter administrator's name."],
    },
    dob: {
      type: Date,
      required: [true, "Please enter administrator's date of Birth."],
    },
    nationality: {
      type: String,
      required: [true, "Please enter administrator's nationality."],
    },
    placeOfBirth: {
      type: String,
      required: [true, "Please enter administrator's place of Birth."],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please enter administrator's phone number."],
      unique: [true, "Phone number already exist."],
    },
    password: {
      type: String,
      required: [true, "Please enter password."],
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please enter password again."],
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: "Password mismatched.",
      },
    },
    passwordResetToken: {
      type: String,
    },
    photo: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
adminSchema.pre("save", async function (next) {
  //   // 1. Setting comfirm number code
  //   this.confirmNumberCode = Math.ceil(Math.random() * 1000000);
  // Removing passwordConfirm Field
  this.passwordConfirm = undefined;
  //3: Making slug out the name
  //   this.slug = slug(this.name);
  //   // 4. Creating qrCodes
  //   this.qrCode = `qrCodes/${this.slug}.png`;
  // 5: passwordChangedAt
  this.PasswordChangedAt = new Date(Date.now());
  next();
});

// Compare password
adminSchema.methods.comparePassword = async function (
  currentPassword,
  hashedPassword
) {
  return await bcrypt.compare(currentPassword, hashedPassword);
};
// Encrypt password
adminSchema.methods.encryptpassword = async function (rawpassword) {
  //  Encrypting password
  return await bcrypt.hash(rawpassword, 10);
};

const adminModel = mongoose.model("administrators", adminSchema);

adminModel.syncIndexes();

module.exports = adminModel;
