const Post = require("../model/postModel");
const User = require("../model/userModel");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary");
const { v4: uuid } = require("uuid");
const HttpError = require("../model/errorModel");

const createPost = async (req, res, next) => {
  try {
    let { title, category, description } = req.body;
    if (!title || !category || !description || !req.files) {
      return next(new HttpError("Fill in all fields choose thumbnail", 422));
    }
    const { thumbnail } = req.files;
    if (thumbnail.size > 2000000) {
      return next(
        new HttpError("Thumbnail too big. File should be less than 2mb.")
      );
    }

    // Construct temporary file path for local storage
    const tempFilePath = `uploads/${Date.now()}-${thumbnail.name}`;

    // Move the uploaded file to the temporary file path
    await thumbnail.mv(tempFilePath);

    // Upload the temporary file to Cloudinary
    const result = await cloudinary.uploader.upload(tempFilePath);

    // Cleanup: Delete the temporary file
    fs.unlinkSync(tempFilePath);

    // Create new post with Cloudinary URL
    const newPost = await Post.create({
      title,
      category,
      description,
      thumbnail: result.secure_url, // Use Cloudinary URL as thumbnail
      creator: req.user.id,
    });

    if (!newPost) {
      return next(new HttpError("Post couldn't be created.", 422));
    }

    // Increment user's post count
    const currentUser = await User.findById(req.user.id);
    const userPostCount = currentUser.posts + 1;
    await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    return next(new HttpError(error));
  }
};

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({
      updatedAt: -1,
    });
    res.status(200).json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

const getPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new HttpError("Post not found.", 422));
    }
    res.status(200).json(post);
  } catch (error) {
    return next(new HttpError(error));
  }
};

const getCatPost = async (req, res, next) => {
  try {
    const { category } = req.params;
    const catPosts = await Post.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(catPosts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

const getUserPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

const updatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    let { title, category, description } = req.body;

    // Validate input fields
    if (!title || !category || description.length < 12) {
      return next(new HttpError("Fill in all fields.", 422));
    }

    // Find the old post by ID
    const oldPost = await Post.findById(postId);

    // Check if the logged-in user is the creator of the post
    if (req.user.id === oldPost.creator.toString()) {
      let updatePost;

      if (!req.files || !req.files.thumbnail) {
        // If no new thumbnail is uploaded, update the post without changing the thumbnail
        updatePost = await Post.findByIdAndUpdate(
          postId,
          { title, category, description },
          { new: true }
        );
      } else {
        // If a new thumbnail is uploaded, delete the old thumbnail from Cloudinary
        await cloudinary.uploader.destroy(oldPost.thumbnail);

        // Upload the new thumbnail to Cloudinary
        const { thumbnail } = req.files;

        // Construct temporary file path for local storage
        const tempFilePath = `uploads/${Date.now()}-${thumbnail.name}`;

        // Move the uploaded file to the temporary file path
        await thumbnail.mv(tempFilePath);

        // Upload the temporary file to Cloudinary
        const result = await cloudinary.uploader.upload(tempFilePath);

        // Cleanup: Delete the temporary file
        fs.unlinkSync(tempFilePath);

        // Update the post with the new thumbnail URL
        updatePost = await Post.findByIdAndUpdate(
          postId,
          {
            title,
            category,
            description,
            thumbnail: result.secure_url,
          },
          { new: true }
        );
      }

      if (!updatePost) {
        return next(new HttpError("Couldn't update post.", 400));
      }

      res.status(200).json(updatePost);
    } else {
      return next(new HttpError("Unauthorized to update this post.", 401));
    }
  } catch (error) {
    console.error(error);
    // Handle error
    return next(new HttpError("Error updating post.", 500));
  }
};

const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    if (!postId) {
      return next(new HttpError("Post Unavailable", 400));
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return next(new HttpError("Post not found", 404));
    }

    // Check if the logged-in user is the creator of the post
    if (req.user.id !== post.creator.toString()) {
      return next(new HttpError("Unauthorized to delete this post.", 403));
    }

    // Delete the post's thumbnail from Cloudinary
    if (post.thumbnail) {
      await cloudinary.uploader.destroy(post.thumbnail);
    }

    // Delete the post from the database
    await Post.findByIdAndDelete(postId);

    // Update user's post count
    const currentUser = await User.findById(req.user.id);
    if (currentUser && currentUser.posts > 0) {
      currentUser.posts -= 1;
      await currentUser.save();
    }

    res.json(`Post ${postId} deleted successfully.`);
  } catch (error) {
    console.error(error);
    return next(new HttpError("Error deleting post.", 500));
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  getCatPost,
  getUserPost,
  updatePost,
  deletePost,
};
