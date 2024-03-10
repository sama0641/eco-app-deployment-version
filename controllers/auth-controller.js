require("dotenv").config();
const CustomError = require("../ErrorHandling/Error");
const User = require("../models/User");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//Express validator validationResult is used to get any errors if there were any in previous steps
const { validationResult } = require("express-validator");

exports.registrationController = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      console.log(errors);
      throw new CustomError(400, "Wrong inputs, validation failed");
    }
    const { fullname, email, role, password } = req.body;
    // Check if an admin user exists
    const adminUser = await User.findOne({ role: "admin" });

    if (adminUser && role.toLowerCase() === "admin") {
      throw new CustomError(403, "You are not authorized to register as admin");
    }

    let newUser;

    if (role.toLowerCase() === "admin") {
      // Use the Admin model for admin registration
      newUser = await Admin.create({
        fullname,
        email,
        role,
        password: await bcrypt.hash(password.toString(), 10),
        products: [], // Initialize the products field for admins
      });
    } else {
      // Use the User model for non-admin registration
      newUser = await User.create({
        fullname,
        email,
        role,
        password: await bcrypt.hash(password.toString(), 10),
      });
    }

    return res.json({
      success: true,
      user: newUser,
    });
  } catch (err) {
    return next(err);
  }
};

// => Logging in a user
exports.loginController = async (req, res, next) => {
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      throw new CustomError(400, "Wrong inputs, validation failed");
    }
    console.log("Hit");
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return next(new CustomError(401, "Incorrect login credentials"));
    }
    const passwordComparison = await bcrypt.compare(password, user.password);
    if (!passwordComparison) {
      return next(new CustomError(401, "Incorrect login credentials"));
    }
    const dataForToken = {
      userId: user._id,
      username: user.fullname,
      role: user.role,
    };
    const token = jwt.sign(dataForToken, process.env.JWT_KEY);

    // Create a new user object without the password
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    // Set the cookie with the same options
    res
      .cookie("access_token", token, {
        secure: true,
      })
      .header("Access-Control-Allow-Credentials", "true")
      .status(200)
      .json({
        success: true,
        message: "Successfully Logged in",
        user: userWithoutPassword,
      });

    return res;
  } catch (err) {
    return next(err);
  }
};
