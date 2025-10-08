const logger = require("../utils/logger");
const express = require("express");
const Post = require("../models/post-model");

//create post
const createPost = async (req, res) => {
  logger.info("Create post endpoint hit");
  try {
    //validate the schema
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { content, mediaIds } = req.body;
    const newlyCreatedPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });


    //save post to database
    const savedPost = await newlyCreatedPost.save();

    return res.status(201).json({
      success: true,
      message: "post created successfully",
      data: savedPost,
    });
  } catch (error) {
    logger.error("Create post error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//get all post
const getAllPosts = async (req, res) => {
  logger.info("Get all post endpoint hit...");
  try {
  } catch (error) {
    logger.error("get all post error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//get a post
const getSinglePost = async (req, res) => {
  logger.info("Get a post endpoint hit...");
  try {
  } catch (error) {
    logger.error("get a post error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//Delete a post
const deleteSinglePost = async (req, res) => {
  logger.info(" Post delete endpoint hit...");
  try {
  } catch (error) {
    logger.error("Deleting a post error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {createPost, getAllPosts, getSinglePost, deleteSinglePost}