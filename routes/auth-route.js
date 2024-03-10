const express = require("express");
const router = express.Router();

//Express validator is used to validate incoming requsest bodies
const { body } = require("express-validator");

const {
  registrationController,
  loginController,
} = require("../controllers/auth-controller");

router.post(
  "/register",
  [
    body("fullname")
      .notEmpty()
      .withMessage("Fullname is required")
      .isLength({ min: 4 })
      .withMessage("Fullname must be at least 4 characters long"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(["admin", "farmer"])
      .withMessage("Invalid role"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 7 })
      .withMessage("Password must be at least 7 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d{2,})/)
      .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, and two digits"
      ),
  ],
  registrationController
);

router.post(
  "/login",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 1 })
      .withMessage("Password must be at least 1 character long"),
  ],
  loginController
);

module.exports = router;
