const express = require("express");
const router = express.Router();

//Middleware added to verify if person is admin or not
const adminVerification = require("../utils/adminVerification");

//Express validator is used to validate incoming requsest bodies
const { body, param } = require("express-validator");

const {
  getAllProducts,
  getOneProduct,
  createProduct,
  editProductHandler,
  deleteProductHandler,
  getAllForumTopicsHandler,
  getPrivateProducts,
} = require("../controllers/admin-controller");

router.get("/getAllProducts", getAllProducts);

router.get("/getPrivateProducts", adminVerification, getPrivateProducts);

router.get("/getAllForumTopics", getAllForumTopicsHandler);

router.get(
  "/getOneProduct/:productId",
  [
    param("productId")
      .notEmpty()
      .withMessage("Product ID is required")
      .isMongoId()
      .withMessage("Invalid Product ID"),
  ],
  getOneProduct
);

router.post(
  "/createProduct",
  adminVerification,
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .matches("^[0-9a-zA-Z,?.! ]+$")
      .withMessage(
        "Name must contain only alphabets, numbers, and spaces,comma,period,spaces or exclamation marks"
      ),
    body("description")
      .notEmpty()
      .withMessage("Description is required")
      .matches("^[0-9a-zA-Z,?.! ]+$")
      .withMessage(
        "Description must contain only alphabets, numbers, and spaces,comma,period,spaces or exclamation marks"
      ),
    body("image").notEmpty().withMessage("Image is required"),
    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isNumeric()
      .withMessage("Price must be a number")
      .custom((value) => value >= 1)
      .withMessage("Price must be at least 1"),
    body("quantity")
      .notEmpty()
      .withMessage("Quantity is required")
      .isInt()
      .withMessage("Quantity must be an integer")
      .custom((value) => value >= 1)
      .withMessage("Quantity must be at least 1"),
    body("privacy")
      .notEmpty()
      .withMessage("Privacy is required")
      .isIn(["private", "public"])
      .withMessage('Privacy must be either "private" or "public"'),
  ],
  createProduct
);

router.delete(
  "/deleteProduct/:productId",
  adminVerification,
  [
    param("productId")
      .notEmpty()
      .withMessage("Product ID is required")
      .isMongoId()
      .withMessage("Invalid Product ID"),
  ],
  deleteProductHandler
);

router.patch(
  "/editProduct/:productId",
  adminVerification,
  [
    param("productId")
      .notEmpty()
      .withMessage("Product ID is required")
      .isMongoId()
      .withMessage("Invalid Product ID"),
    body("name").notEmpty().withMessage("Name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("image").notEmpty().withMessage("Image is required"),
    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isNumeric()
      .withMessage("Price must be a number")
      .custom((value) => value >= 1)
      .withMessage("Price must be at least 1"),
    body("quantity")
      .notEmpty()
      .withMessage("Quantity is required")
      .isInt()
      .withMessage("Quantity must be an integer")
      .custom((value) => value >= 1)
      .withMessage("Quantity must be at least 1"),
    body("privacy")
      .notEmpty()
      .withMessage("Privacy is required")
      .isIn(["private", "public"])
      .withMessage('Privacy must be either "private" or "public"'),
  ],
  editProductHandler
);

module.exports = router;
