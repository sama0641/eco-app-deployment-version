const User = require("../models/User");
const ForumTopic = require("../models/ForumTopic");
const UserComment = require("../models/Comment");
const CustomError = require("../ErrorHandling/Error");

//Express validator validationResult is used to get any errors if there were any in previous steps
const { validationResult } = require("express-validator");

exports.getAllTopicsController = async (req, res, next) => {
  try {
    const topics = await ForumTopic.find({ privacy: "public" });
    res.status(200).json({ success: true, topics });
  } catch (err) {
    return next(err);
  }
};

exports.getIndividualTopicController = async (req, res, next) => {
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      throw new CustomError(400, "Invalid inputs");
    }
    const { id } = req.params;
    const { userId, role } = req.user;
    const topic = await ForumTopic.findById(id);

    if (!topic) {
      throw new CustomError(404, "No such post exists");
    }

    // Check if the topic is public or if the user has permission to access private topics
    const isPublic = topic.privacy === "public";
    const isPrivateAuthorized =
      isPublic || topic.createdBy.toString() === userId || role === "admin";

    if (!isPrivateAuthorized) {
      throw new CustomError(403, "Unauthorized access to private topic");
    }

    // Fetch the creator's fullname separately
    const creator = await User.findById(topic.createdBy);

    res.status(200).json({
      success: true,
      post: {
        _id: topic._id,
        title: topic.title,
        description: topic.description,
        comments: topic.comments,
        fullname: creator.fullname,
        timeOfCreation: topic.timeOfCreation,
        privacy: topic.privacy,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.createTopicController = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      throw new CustomError(400, "Invalid inputs");
    }
    const { title, description, privacy } = req.body;
    const { userId } = req.user;

    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError(404, "User not found");
    }

    const newTopic = await ForumTopic.create({
      title,
      description,
      privacy,
      createdBy: userId,
    });

    await User.findByIdAndUpdate(userId, { $push: { articles: newTopic._id } });

    return res.status(201).json({
      success: true,
      newTopic: newTopic,
    });
  } catch (err) {
    return next(err);
  }
};

// Edit an existing forum topic
exports.editTopicController = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      console.log(errors);
      throw new CustomError(400, "Invalid inputs");
    }
    const { title, description, privacy } = req.body;
    const topicId = req.params.id;
    const { userId } = req.user;

    // Check if the user has the permission to edit the topic
    const existingTopic = await ForumTopic.findById(topicId);

    if (!existingTopic) {
      throw new CustomError(404, "Topic not found");
    }

    if (existingTopic.createdBy.toString() !== userId) {
      throw new CustomError(403, "Permission denied");
    }

    // Update the topic
    const updatedTopic = await ForumTopic.findByIdAndUpdate(
      topicId,
      { title, description, privacy },
      { new: true }
    );

    res.status(200).json({ success: true, updatedTopic });
  } catch (error) {
    return next(error);
  }
};

// Delete a forum topic
exports.deleteTopicController = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      throw new CustomError(400, "Validation failed");
    }
    const topicId = req.params.id;
    const { userId } = req.user;
    // Check if the user with userId exists
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError(404, "User not found");
    }

    // Find the topic to be deleted
    const topicToDelete = await ForumTopic.findById(topicId);
    if (!topicToDelete) {
      throw new CustomError(404, "Topic not found");
    }

    // Check if the topic was created by the current user
    if (topicToDelete.createdBy.toString() === userId) {
      // Delete the topic
      await ForumTopic.findByIdAndDelete(topicId);

      // Remove the topic from the user's articles array
      await User.findByIdAndUpdate(userId, { $pull: { articles: topicId } });

      res
        .status(200)
        .json({ success: true, message: "Topic deleted successfully" });
    } else {
      // If the topic wasn't created by the current user
      throw new CustomError(
        403,
        "Permission denied. You are not the creator of this topic."
      );
    }
  } catch (error) {
    return next(error);
  }
};

// Get all topics of a person
exports.getTopicsOfAnIndividualController = async (req, res, next) => {
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      throw new CustomError(400, "Invalid inputs");
    }
    const { userId } = req.user;
    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError(404, "User not found");
    }

    // Retrieve all topics based on the IDs stored in the user's articles property
    const userTopics = await ForumTopic.find({ _id: { $in: user.articles } });

    return res.status(200).json({
      success: true,
      userTopics: userTopics,
    });
  } catch (err) {
    return next(err);
  }
};

//Create a comment
exports.createAComment = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      throw new CustomError(400, "Invalid inputs");
    }
    const { userId } = req.user;
    const topicId = req.params.id;
    const { message } = req.body;
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError(404, "User not found");
    }

    // Find the topic by ID
    const topic = await ForumTopic.findById(topicId);

    if (!topic) {
      throw new CustomError(404, "Topic not found");
    }

    // Create a new comment
    const newComment = new UserComment({
      message,
      createdBy: userId,
    });

    // Save the comment
    await newComment.save();

    // Add the comment to the topic's comments array
    topic.comments.push(newComment);

    // Save the updated topic
    await topic.save();

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    return next(error);
  }
};

//Get query results
exports.getResultsForQuery = async (req, res, next) => {
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      throw new CustomError(400, "Invalid Query");
    }
    const { query } = req.params;
    // Validate if the query is present
    if (!query) {
      throw new CustomError(400, "Query is required");
    }

    // Fetch all ForumTopics
    const allTopics = await ForumTopic.find();

    // Split the query into words
    const keywords = query.split(" ");

    // Filter topics based on keyword presence in titles
    const matchingTopics = allTopics.filter((topic) => {
      const titleWords = topic.title.split(" ");
      return keywords.some((keyword) => titleWords.includes(keyword));
    });

    return res.status(200).json({
      success: true,
      matchingTopics: matchingTopics || [],
    });
  } catch (err) {
    return next(err);
  }
};
