const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Assuming the image will be stored as a file path or URL
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  privacy: {
    type: String,
    enum: ["public", "private"], // Assuming privacy can only be "public" or "private"
    required: true,
  },
  savedBy: {
    type: Array,
    default: [],
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
