const mongoose = require("mongoose");
const User = require("./User"); // Import the User model

const adminSchema = new mongoose.Schema({
  // Additional fields for admin users
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Reference to products in the 'users' collection
});

const Admin = User.discriminator("Admin", adminSchema);

module.exports = Admin;
