const jwt = require("jsonwebtoken");
const AppError = require("./errorController");
const paymentModel = require("./../models/paymentReceipt");
// Generate and send Token
exports.generateToken = function (res, member) {
  const token = jwt.sign(
    { name: member.name, id: member._id },
    process.env.SECRET_KEY,
    {
      expiresIn: 1000 * 60 * 20,
    }
  );

  res.cookie("loginToken", token, {
    maxAge: 2 * 60 * 60 * 1000,
    httpOnly: true,
    // secure:true,
  });
};

exports.createUser = function (model, generateToken) {
  return async function (req, res, next) {
    try {
      const { body } = req;

      if (req.file !== undefined && req.file.filename)
        body.photo = `userphotos/${req.file.filename}`;
      else body.photo = undefined;

      let user = await model.create(body);
      user.password = await user.encryptpassword(user.password);
      user = await model.findByIdAndUpdate(user._id, user);

      // Creating QrCode file(png)
      if (user.role === "member")
        try {
          qrcode.toFile(
            `public/qrCodes/${user.slug}.png`,
            `${req.protocol}://${req.host}/scan/${user._id}`,
            { type: "" },
            (err) => {
              console.log(err);
            }
          );
        } catch (err) {
          if (err) console.log(err);
          console.log(err, "QRcode error");
        }

      // Sending message to new Memebers
      // try {
      //   const fetchConfig = {
      //     method: "post",
      //     headers: {
      //       Authorization: "Basic VEtBVWp0b0c6TWdTTEVuT1ByRw==",
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       from: "ANNK",
      //       to: user.phoneNumber,
      //       msg: `Hello ${
      //         user.name.split(" ")[0]
      //       }, Welcome to ANNK Enter the following code to confirm registration. code - ${
      //         user.confirmNumberCode
      //       }`,
      //     }),
      //   };
      //   const res = await fetch(
      //     `https://api.giantsms.com/api/v1/send`,
      //     fetchConfig
      //   );

      //   const resData = await res.json();
      //   // console.log(resData);
      // } catch (err) {
      //   console.log(err);
      // }

      generateToken(res, user);

      if (req.originalUrl.startsWith("/api/v1")) {
        res.status(201).json({
          status: "success",
          message: "Successfully created",
          data: {
            user,
          },
        });
      } else {
        if (req.originalUrl.startsWith("/member")) {
          res.render("profilePage", user);
        }
        if (req.originalUrl.startsWith("/admin")) {
          res.render("admin", user);
        }
      }
    } catch (err) {
      console.log(err, "*****");
      next(err);
    }
  };
};

exports.login = (model, generateToken) => {
  return async function (req, res, next) {
    try {
      const { phoneNumber, password } = req.body;
      if (!phoneNumber || !password)
        next(new AppError("Please provide phone number and Password.", 400));

      let user = await model.findOne({ phoneNumber }).select("+password");
      if (
        !user ||
        (await user.comparePassword(password, user.password)) === false
      )
        next(new AppError("Invalid username or password.", 400));
      else {
        user.password = undefined;
        delete user.password;

        generateToken(res, user);

        if (req.originalUrl.startsWith("/api"))
          res.status(200).json({
            status: "success",
            message: "Login Successful.",
            id: user._id,
            // data: user,
          });
        else {
          user = { ...user._doc };
          user.dob = Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
          }).format(new Date(user.dob));
          res.status(200).render("admin");
        }
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
};

exports.protect = function (model) {
  return async function (req, res, next) {
    try {
      if (req.originalUrl.startsWith("/api")) {
        if (req.headers.cookie === undefined)
          throw new AppError("Please login again.", 400);

        const cookie = req.headers.cookie.split("=")[1];
        const payload = jwt.decode(cookie);

        if (!cookie || !payload) throw new AppError("Please login again.", 400);

        const member = await model.findById(payload.id).select("+password");

        if (!member) throw new AppError("User doesnt exist anymore.", 400);

        if (new Date(member.passwordChangedAt) / 1000 > payload.iat)
          throw new AppError("Password was recently changed", 400);

        if (member.numberVerified === false)
          throw new AppError("Please verify number to use this platform");

        const memberDate = new Date(member.dob);
        let day = `${memberDate.getDate()}`.padStart(2, "0");
        let month = `${1 + memberDate.getMonth()}`.padStart(2, "0");
        let year = memberDate.getFullYear();
        const transformedDate = `${year} ${month} ${day}`;

        member.dob2 = transformedDate;
        // console.log(transformedDate);
        req.user = member;
        res.locals.user = { ...member._doc };
        res.locals.user.dob2 = transformedDate;

        next();
      } else {
        if (req.headers.cookie === undefined) res.status(400).render("login");
        else {
          const cookie = req.headers.cookie.split("=")[1];
          const payload = jwt.decode(cookie);
          if (!cookie || !payload) res.status(400).render("login");
          else {
            const member = await model.findById(payload.id);

            if (!member)
              throw new AppError("User doesnt exist anymore. Click Login", 400);

            req.user = member;
            res.locals.user = member;

            if (new Date(member.passwordChangedAt) / 1000 > payload.iat)
              throw new AppError("Password was recently changed", 400);

            if (member.numberVerified === false)
              return res
                .status(200)
                .render("verifyNumber", { userid: member._id });

            const memberDate = new Date(member.dob);
            console.log();
            let day = `${memberDate.getDate()}`.padStart(2, "0");
            let month = `${1 + memberDate.getMonth()}`.padStart(2, "0");
            let year = memberDate.getFullYear();
            const transformedDate = `${year}-${month}-${day}`;
            member.dob2 = transformedDate;
            res.locals.user = { ...member._doc };
            res.locals.user.dob2 = transformedDate;
            next();
          }
        }
      }
    } catch (err) {
      // console.log(err);
      next(err);
    }
  };
};

exports.viewProfile = function () {
  return async function (req, res, next) {
    try {
      const { user } = res.locals;
      const transactions = await paymentModel.aggregate([
        {
          $match: {
            annkId: user._id,
          },
        },
        {
          $group: {
            _id: { $year: "$datePaid" },
            annualSummary: { $sum: "$amount" },
            monthlyPayments: {
              $push: {
                name: "$name",
                annkId: "$annkId",
                amount: "$amount",
                datePaid: "$datePaid",
              },
            },
          },
        },
      ]);

      if (transactions.length > 0)
        res.locals.user.dues = transactions.sort(
          (annua, next) => next._id - annua._id
        );
      // console.log(transactions);
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
      } else {
        if (req.originalUrl.startsWith("/member") && user)
          res.render("profilepage");
        if (req.originalUrl.startsWith("/admin") && user)
          res.status(200).render("admin");
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
};

exports.renderLoginPage = function (req, res, next) {
  res.status(200).render("login");
};
