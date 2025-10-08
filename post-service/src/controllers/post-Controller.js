const logger = require("../utils/logger");
const express = require("express");
const Post = require("../models/post-model");
const { validateCreatePost } = require("../utils/validation");
const { invalid } = require("joi");

//invalidate Post from cache (useful for single post)
async function invalidatePostCache(req, input) {
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);

  const keys = await req.redisClient.keys("posts:*");
  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
}

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

    await invalidatePostCache(req, newlyCreatedPost._id.toString());
    logger.info("Post created successfully", newlyCreatedPost);
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cacheKey);

    //if redis have posts
    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }

    // if not then go to mongodb
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNoOfPosts = await Post.countDocuments();

    const result = {
      posts,
      currentpage: page,
      totalPages: Math.ceil(totalNoOfPosts / limit),
      totalPages: totalNoOfPosts,
    };

    //save your posts in redis cache
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));
    res.json(result);
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
    const postId = req.params.id;
    const cacheKey = `post: ${postId}`;
    const cachedPost = await req.redisClient.get(cacheKey);

    if (cachedPost) {
      return res.json(JSON.parse(cachedPost));
    }

    //if not in cache
    const singlePostDetailsbyId = await Post.findById(postId);

    if (!singlePostDetailsbyId) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    await req.redisClient.setex(
      cachedPost,
      3600,
      JSON.stringify(singlePostDetailsbyId)
    );

    res.json({ content: singlePostDetailsbyId.content });
  } catch (error) {
    logger.error("Error fetching post", error);
    res.status(500).json({
      success: false,
      message: "Error fetching post by ID",
    });
  }
};

//Delete a post
const deleteSinglePost = async (req, res) => {
  logger.info(" Post delete endpoint hit...");
  try {
    const post = await Post.findByIdAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    await invalidatePostCache(req, req.params.id);
    res.json({
      message: "Post deleted succesfully",
    });
  } catch (error) {
    logger.error("Deleting a post error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { createPost, getAllPosts, getSinglePost, deleteSinglePost };
