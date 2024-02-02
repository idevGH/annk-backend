// Custom imports
const memberModel = require("./../models/memberModel");
const AppError = require("../factoryFunc/errorController");

exports.getScannedMember = async (req, res, next) => {
  try {
    // 1: Getting the id of the member
    const { annkId } = req.params;
    // 2:Finding the user with the ID
    const member = await memberModel.findById(annkId);
    // 3: Sending error if user with such ID doesn't exist
    if (!member) throw new AppError("User doesn't exist", 400);
    const filteredObj = {
      name: member.name,
      gender: member.gender,
      position: "Member",
      photo: member.photo,
    };
    // 4:Sending response
    res.status(200).render("scannedMember", filteredObj);
  } catch (err) {
    next(err);
  }
};
