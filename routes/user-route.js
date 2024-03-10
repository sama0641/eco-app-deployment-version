const express = require("express");
const router = express.Router();
const verify = require("../utils/JWTVerification");
const multer = require("multer");
const upload = multer({ dest: "uploads/ProfilePictures" });

const {
  updateProfilePicture,
  getUserData,
} = require("../controllers/user-controller");

router.post(
  "/updateProfilePicture",
  verify,
  upload.single("file"),
  updateProfilePicture
);

router.get("/getUserData", verify, getUserData);

module.exports = router;
