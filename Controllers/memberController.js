// Twilio config
const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);
// Multer
const multer = require("multer");
// Sharp
const sharp = require("sharp");
// qrcode
const qrcode = require("qrcode");
// slug
const slug = require("slug");
// jwt
const jwt = require("jsonwebtoken");

const { promisify } = require("util");
// Custom imports
const memberModel = require("./../models/memberModel");
const AppError = require("../factoryFunc/errorController");

/////////////////////////////////////////////
// Module functions
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, `${__dirname}/../public/userPhotos`);
//   },
//   filename: (req, file, cb) => {
//     const imageExtension = file.mimetype.split("/")[1];
//     const filename = `${req.body.name}-${Date.now()}.${imageExtension}`;
//     cb(null, filename);
//   },
// });
const multerStorage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    // const imageExtension = file.mimetype.split("/")[1];
    // const filename = `${req.body.name}-${Date.now()}.jpeg`;
    // file.filename = filename.toLocaleLowerCase();
    cb(null, true);
  } else cb(new Error("Please upload an image"), false);
};
const upload = multer({
  storage: multerStorage,
  fileFilter: imageFilter,
});
////////////////////////////////////////
// Image file middleware handler
exports.uploadSingleImage = upload.single("photo");
// Image manipulate(resize, save) middleware
exports.imageManipulate = (req, res, next) => {
  try {
    if (req.file && req.body.name) {
      const imageExtension = req.file.mimetype.split("/")[1];
      const filename = `${req.body.name}-${Date.now()}.jpeg`;
      req.file.filename = filename.toLocaleLowerCase().replaceAll(" ", "-");

      sharp(req.file.buffer)
        .resize(800, 800, {
          // fit: "contain",
          background: "white",
          position: "top",
        })
        .jpeg({
          quality: 50,
        })
        .toFormat("jpeg")
        .toFile(`public/userphotos/${req.file.filename}`, (err) => {
          throw err;
        });
      next();
    } else next();
  } catch (err) {
    next(err);
  }
};
// Member functions
exports.addMember = async function (req, res, next) {
  try {
    const { body } = req;
    if (req.file.filename) body.photo = `userPhotos/${req.file.filename}`;

    const newMember = await memberModel.create(body);

    //   2. Sending Code
    // try {
    //   const message = await promisify(client.messages.create)({
    //     body: `Your verfication number is ${newMember.confirmNumberCode}`,
    //     from: "+16592243778",
    //     to: "+233554088124",
    //   });
    //   console.log(message.sid);
    // } catch (err) {
    //   console.log(err);
    // }
    // creating QRcode for the new member
    try {
      qrcode.toFile(
        `./public/qrcodes/${newMember.slug}.png`,
        `https://annk/scan/`,
        { type: "" },
        (err) => {
          console.log(err);
        }
      );
    } catch (err) {
      console.log(err, "QRcode error");
    }

    if (req.originalUrl.startsWith("/api/v1")) {
      res.status(201).json({
        status: "success",
        message: "Successfully created",
        data: {
          newMember,
        },
      });
    }
    if (req.originalUrl.startsWith("/member")) {
      res.render("profilePage", newMember);
    }
  } catch (err) {
    console.log(err.name, "*****");
    next(err);
  }
};

// View Profile
exports.viewProfile = async function (req, res, next) {
  try {
    const { user } = res.locals;
    // const { annkId } = req.params;

    // let member = await memberModel.findById(annkId);
    // // console.log(member, "666");
    // if (!member || member === null)
    //   throw new AppError(`ANNK member does not exist.`, 400);

    if (req.originalUrl.startsWith("/api/v1") && user) {
      res.status(200).json({
        status: "success",
        message: "Successfully Loaded...",
        data: {
          member: user,
        },
      });
    }
    if (req.originalUrl.startsWith("/member") && user) {
      // member = { ...member._doc };

      // const memberDate = new Date(member.dob);

      // member.dob = Intl.DateTimeFormat("en-US", {
      //   dateStyle: "medium",
      // }).format(memberDate);

      res.render("profilePage");
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.updateprofile = async (req, res, next) => {
  const { annkId } = req.params;
  const { body } = req;

  const forbiddenFields = ["password", "passwordConfirm"];
  const bodyFields = Object.keys(body);

  if (
    forbiddenFields.some((field) => {
      return bodyFields.some((bField) => bField === field);
    })
  )
    next(new AppError("Can't update password Fields with this route.", 401));

  if (req.file) body.photo = `userPhotos/${req.file.filename}`;
  let member = await memberModel.findById(annkId);
  const allowedFields = [
    "name",
    "dob",
    "nationality",
    "placeOfBirth",
    "digitalAddress",
    "phoneNumber",
    "companyName",
    "companyLocation",
    "email",
    "photo",
  ];
  const filteredObj = {};
  try {
    allowedFields.forEach((fieldName) => {
      if (body[`${fieldName}`])
        filteredObj[`${fieldName}`] = body[`${fieldName}`];
    });
    // creating QRcode path
    if (body.name) {
      filteredObj.qrCode = await member.createQRCode(slug(body.name));
      filteredObj.slug = slug(body.name);
    }

    // Saving updating member doc
    const updatedProfile = await memberModel.findByIdAndUpdate(
      annkId,
      filteredObj,
      {
        new: true,
        runValidators: false,
      }
    );
    // Sending response
    if (req.originalUrl.startsWith("/api"))
      res.status(203).json({
        status: "success",
        message: "Profile updated successfully.",
        data: updatedProfile,
      });

    if (req.originalUrl.startsWith("/member")) {
      // res.cookie("token",,{maxAge:"20m"});
      res.render("profilePage", updatedProfile);
    }

    // console.log(updatedProfile);
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async function (req, res, next) {
  try {
    const { currentPassword, password, passwordConfirm } = req.body;
    const { annkId } = req.params;
    if (!password || !currentPassword || !passwordConfirm)
      next(
        new AppError(
          "Please provide current password, New Password and password Confirm",
          400
        )
      );
    // Getting the user
    const member = await memberModel.findById(annkId).select("+password");
    if (!member) next(new AppError("ANNK member doesnt exist.", 400));
    if (
      (await member.comparePassword(currentPassword, member.password)) === false
    )
      next(new AppError("Incorrect password", 400));
    else {
      // Setting the password and password property on the member Object
      member.password = password;
      member.passwordConfirm = passwordConfirm;
      // SAving
      const updatedMember = await member.save({ runValidators: true });

      if (req.originalUrl.startsWith("/api")) {
        res.status(201).json({
          status: "success",
          message: "Password updated successfully.",
          data: updatedMember,
        });
      }
    }
  } catch (err) {
    // console.log(err);
    next(err);
  }
};

exports.protect = async function (req, res, next) {
  try {
    if (req.headers.cookie === undefined)
      throw new AppError("Please login again.", 400);
    const cookie = req.headers.cookie.split("=")[1];
    const payload = jwt.decode(cookie);

    if (!cookie || !payload) throw new AppError("Please login again.", 400);

    const member = await memberModel.findById(payload.id);

    if (!member) throw new AppError("User doesnt exist anymore.", 400);

    if (new Date(member.passwordChangedAt) / 1000 > payload.iat)
      throw new AppError("Password was recently changed", 400);

    const dobFormat = (res.locals.user = member);

    next();
  } catch (err) {
    next(err);
  }
};

exports.login = async function (req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      next(new AppError("Please provide Email and Password.", 400));

    let member = await memberModel.findOne({ email }).select("+password");

    if (
      !member ||
      (await member.comparePassword(password, member.password)) === false
    )
      next(new AppError("Invalid username or password.", 400));
    else {
      member.password = undefined;

      const token = jwt.sign(
        { name: member.name, id: member._id },
        process.env.SECRET_KEY,
        {
          expiresIn: 1000 * 60 * 20,
        }
      );

      res.cookie("loginToken", token, {
        maxAge: 20 * 60 * 1000,
        httpOnly: true,
        // secure:true,
      });

      if (req.originalUrl.startsWith("/api"))
        res.status(200).json({
          status: "success",
          message: "Login Successful.",
          id: member._id,
          // data: member,
        });
      else {
        member = { ...member._doc };
        member.dob = Intl.DateTimeFormat("en-GB", {
          dateStyle: "medium",
        }).format(new Date(member.dob));

        res.status(200).render("profilePage", member);
      }
    }
  } catch (err) {
    next(err);
  }
};

exports.logout = async function (req, res, next) {
  res.cookie("loginToken", "logout");
  res.status(200).render("login");
};
exports.renderEditpage = function (req, res, next) {
  res.render("editprofile");
};
exports.renderLoginPage = function (req, res, next) {
  res.status(200).render("login");
};

// toString("127.0.0.1:8090/member", { type: "svg" });
// .console
//   .log(s);
