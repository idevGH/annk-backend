// Requiring third party modules
const validator = require("validator");
// Requiring Mongoose
const mongoose = require("mongoose");
// slug
const slug = require("slug");
// qrCode
const qrcode = require("qrcode");
// Axios
// const axios = require("axios");
// bcrypt import
const bcrypt = require("bcrypt");

// Creating Schema
const memberSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Enter your name"],
      minLength: [2, "Name cannot be shorter than 2 characters"],
    },
    dob: {
      type: Date,
      required: [true, "Please provide Date of Birth"],
    },
    nationality: {
      type: String,
      default: "Ghanaian",
    },
    placeOfBirth: {
      type: String,
      required: [true, "Please specify where you were born"],
    },
    digitalAddress: {
      type: String,
      default: "BX-0000-00",
    },
    phoneNumber: {
      type: String,
      required: [true, "Please enter Phone Number"],
      min: [10, "Phone number cannot be lesser than 10"],
      unique: [true, "Number is already in use."],
    },
    confirmNumberCode: {
      type: Number,
    },
    numberVerified: {
      type: Boolean,
      default: false,
    },
    companyName: {
      type: String,
      required: [true, "Enter herbal organization name"],
      unique: [true, "Comapany name is already in use."],
    },
    companyLocation: {
      type: String,
      required: [true, "Specify Comapny location"],
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "Male", "Female"],
        message: "Gender can be only Male or Female.",
      },
      required: [true, "Specify your Gender [male/female]."],
    },
    photo: {
      type: String,
      default: `userphotos/avatar.jpg`,
    },
    email: {
      type: String,
      // required: true,
      validate: {
        validator: validator.isEmail,
        message: "{VALUE} is not a valid email.",
      },
      unique: [true, "{VALUE} already exist."],
    },
    password: {
      type: String,
      required: [true, "Please enter password."],
      select: false,
    },
    passwordConfirm: {
      type: String,
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Password mismatched.",
      },
      required: [true, "Please re-enter password."],
    },
    passwordRestToken: {
      type: String,
    },
    PasswordChangedAt: {
      type: Date,
      default: new Date(Date.now()),
    },
    verified: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
    },
    qrCode: {
      type: String,
    },
    region: {
      type: String,
      required: [true, "Please specify region"],
    },
    companyNumber: {
      type: String,
    },
    dateOfRegistration: {
      type: Date,
      default: new Date(Date.now()),
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

//
memberSchema.pre("findByIdAndUpdate", function (next) {
  this.options.runValidators = true;
  next();
});

// Pre Save middleware
memberSchema.pre("save", async function (next) {
  // 1. Setting comfirm number code
  this.confirmNumberCode = Math.ceil(Math.random() * 1000000);
  // Removing passwordConfirm Field
  this.passwordConfirm = undefined;
  //3: Making slug out the name
  this.slug = slug(this.name);
  // 4. Creating qrCodes
  this.qrCode = `qrcodes/${this.slug}.png`;
  // 5: passwordChangedAt
  this.PasswordChangedAt = new Date(Date.now());
  next();
});

// methods for docs
memberSchema.methods.createQRCode = async function (slug) {
  // creating QRcode for the new member

  qrcode.toFile(
    `./public/qrcodes/${slug}.png`,
    `${req.protocol}://${req.host}/scan/${slug}`,
    { type: "png" },
    (err) => {
      console.log(err);
    }
  );
  return `qrcodes/${slug}.png`;
};
// Compare password
memberSchema.methods.comparePassword = async function (
  currentPassword,
  hashedPassword
) {
  return await bcrypt.compare(currentPassword, hashedPassword);
};
// Encrypt password
memberSchema.methods.encryptpassword = async function (rawpassword) {
  //  Encrypting password
  return await bcrypt.hash(rawpassword, 10);
};
// Creating model
const memberModel = mongoose.model("Members", memberSchema);
// Ensuring index sync
memberModel.syncIndexes();

// console.log(new Date("1996 01 05"));

// Exporting Member model
module.exports = memberModel;
