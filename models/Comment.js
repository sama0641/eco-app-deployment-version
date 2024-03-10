const mongoose = require("mongoose");

const userCommentSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserComment = mongoose.model("UserComment", userCommentSchema);

module.exports = UserComment;
