import Post from "../../models/Post.js";
import createHttpError from "../../utils/createHttpError.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.findAll();
  return res.status(200).json({ posts });
});

export const createPost = asyncHandler(async (req, res) => {
  const content = req.body.content?.trim();

  if (!content) {
    throw createHttpError(400, "content is required");
  }

  const post = await Post.create({
    userId: req.user.id,
    content
  });

  return res.status(201).json({
    message: "Post created",
    post
  });
});
