const Product = require("../models/Product");
const User = require("../models/User");
const ForumTopic = require("../models/ForumTopic");
const CustomError = require("../ErrorHandling/Error");

//Express validator validationResult is used to get any errors if there were any in previous steps
const { validationResult } = require("express-validator");

//Real code logic happens here----------------------------------

//Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    // Fetch all products with privacy set to public
    const publicProducts = await Product.find({ privacy: "public" });

    res.json({
      success: true,
      products: publicProducts || [],
    });
  } catch (error) {
    next(error);
  }
};

//Get one product
exports.getOneProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Fetch the product by ID
    const product = await Product.findById(productId);

    // Check if the product exists
    if (!product) {
      throw new CustomError(404, "Product not found");
    }

    // Check if the product's privacy property is set to private
    if (product.privacy === "private") {
      throw new CustomError(403, "Access denied. Product is private.");
    }

    res.json({
      success: true,
      product: product || [],
    });
  } catch (error) {
    next(error);
  }
};

// Create Product Handler
exports.createProduct = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(400, "Validation failed");
    }
    const { name, description, image, price, quantity, privacy } = req.body;

    // Create a new product
    const newProduct = await Product.create({
      name,
      description,
      image,
      price,
      quantity,
      privacy,
    });

    // Find the user by ID
    const user = await User.findById(userId);

    // Add the new product's ID to the user's products array
    if (user) {
      user.products.push(newProduct._id);
      await user.save(); // Save the changes to the user
    }

    return res.json({
      success: true,
      product: newProduct,
    });
  } catch (err) {
    return next(err);
  }
};

// Delete Product Handler
exports.deleteProductHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(400, "Validation failed");
    }
    const { productId } = req.params;

    // Check if the product exists

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      throw new CustomError(404, "Product not found");
    }
    await Product.findByIdAndDelete(productId);

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//Edit Product handler
exports.editProductHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      throw new CustomError(400, "Validation failed");
    }

    const { productId } = req.params;
    const { name, description, image, price, quantity, privacy } = req.body;

    // Check if the product exists
    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      throw new CustomError(404, "Product not found");
    }

    // Update the product details
    existingProduct.name = name;
    existingProduct.description = description;
    existingProduct.image = image;
    existingProduct.price = price;
    existingProduct.quantity = quantity;
    existingProduct.privacy = privacy;
    const updatedProduct = await existingProduct.save();

    return res.json({
      success: true,
      updatedProduct,
    });
  } catch (err) {
    return next(err);
  }
};

//Get All Forum Topics, hidden or revealed for Admin's use
exports.getAllForumTopicsHandler = async (req, res, next) => {
  try {
    // Fetch all forum topics
    const allForumTopics = await ForumTopic.find();

    if (!allForumTopics) {
      throw new CustomError(404, "No forum topics found");
    }

    return res.json({
      success: true,
      forumTopics: allForumTopics,
    });
  } catch (err) {
    return next(err);
  }
};

//Get admin's private products
exports.getPrivateProducts = async (req, res, next) => {
  const { userId } = req.user;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError(404, "User not found");
    }

    // Fetch details for each product in the user's products array
    const privateProducts = await Promise.all(
      user.products.map(async (productId) => {
        const product = await Product.findById(productId);

        // Check if the product exists and has privacy set to private
        return product && product.privacy === "private" ? product : null;
      })
    );

    // Filter out null values (products that don't exist or have privacy set to public)
    const filteredPrivateProducts = privateProducts.filter(Boolean);

    return res.json({
      success: true,
      privateProducts: filteredPrivateProducts,
    });
  } catch (err) {
    return next(err);
  }
};
