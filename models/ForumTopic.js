const mongoose = require("mongoose");

const forumTopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  comments: { type: Array, default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true }, // User who created the topic
  timeOfCreation: { type: Date, default: Date.now },
  privacy: { type: String, enum: ["public", "private"], default: "public" }, // Added privacy field
});

const ForumTopic = mongoose.model("ForumTopic", forumTopicSchema);

module.exports = ForumTopic;
