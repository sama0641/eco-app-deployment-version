const User = require("../models/User");
const CustomError = require("../ErrorHandling/Error");
const fs = require("fs");

// Updating a profile picture
exports.updateProfilePicture = async (req, res, next) => {
  const { userId } = req.user;
  try {
    // Check if the user already has a profile picture
    const existingUser = await User.findById(userId);
    if (existingUser.profilePicture) {
      // If yes, delete the existing file
      fs.unlinkSync(existingUser.profilePicture);
    }

    const { originalname } = req.file;
    const fileExtension = originalname.split(".")[1];
    const newFileName = req.file.path + "." + fileExtension;

    fs.renameSync(req.file.path, newFileName);

    // Update the user's profile picture and fetch the updated user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: newFileName },
      { new: true } // This option returns the updated document
    );

    if (!updatedUser) {
      throw new CustomError(500, "Error setting profile picture");
    }

    return res.json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    return next(err);
  }
};

//Getting data for someone who has already logged in
exports.getUserData = async (req, res, next) => {
  try {
    const { userId } = req.user;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(new CustomError(401, "No such user exists"));
    }

    return res.json({
      success: true,
      user: user,
    });
  } catch (error) {
    return next(error);
  }
};
