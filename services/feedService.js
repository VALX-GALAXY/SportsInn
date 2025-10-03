const Post = require("../models/postModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");

async function createPost(user, body) {
  const post = new Post({
    authorId: user._id,
    role: user.role,
    caption: body.caption,
    imageUrl: body.imageUrl,
    likes: []
  });
  await post.save();
  return post;
}

async function getFeed() {
  return Post.find().populate("authorId", "name role").sort({ createdAt: -1 });
}

async function toggleLike(user, postId) {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  const index = post.likes.indexOf(user._id);
  if (index >= 0){
    post.likes.splice(index, 1);
  } 
  else {
    post.likes.push(user._id);
    if (String(post.authorId) !== String(user._id)) {
      await Notification.create({
        userId: post.authorId,
        type: "like",
        message: `${user.name} liked your post`,
      });
    }
  }

  await post.save();
  return post;
}

async function deletePost(user, postId) {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");
  if (String(post.authorId) !== String(user._id)) throw new Error("Not allowed");

  await post.deleteOne();
  return { success: true };
}

async function getPersonalizedFeed(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const posts = await Post.find({ authorId: { $in: user.following } })
    .sort({ createdAt: -1 })
    .populate("authorId", "name role");

  return posts;
}

async function addComment(userId, postId, text) {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  const comment = { userId, text };
  post.comments.push(comment);
  await post.save();
  
  // Notify post author if not commenting on own post
  if (String(post.authorId) !== String(userId)) {
    await Notification.create({
      userId: post.authorId,
      type: "comment",
      message: `User commented on your post`,
    });
  }
  return comment;
}

async function getComments(postId, page = 1, limit = 5) {
  const post = await Post.findById(postId).populate("comments.userId", "name role");
  if (!post) throw new Error("Post not found");

  const start = (page - 1) * limit;
  const end = page * limit;
  return post.comments.slice(start, end);
}

module.exports = {
  createPost,
  getFeed,
  toggleLike,
  deletePost,
  getPersonalizedFeed,
  addComment,
  getComments,
};
