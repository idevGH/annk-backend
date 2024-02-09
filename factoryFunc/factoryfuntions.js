const jwt = require("jsonwebtoken");
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
