const mongoose = require("mongoose");
const Product = require("./Product");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  articles: {
    type: Array,
    default: [],
  },
});

if (userSchema.role === "admin") {
  userSchema.add({
    products: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
    },
  });
}

const User = mongoose.model("User", userSchema);

module.exports = User;
