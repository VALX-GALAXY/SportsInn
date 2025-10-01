const Post = require("../models/postModel");

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
  if (!post) return { error: "Post not found" };

  const index = post.likes.indexOf(user._id);
  if (index >= 0) {
    post.likes.splice(index, 1); // unlike
  } else {
    post.likes.push(user._id); // like
  }
  await post.save();
  return post;
}

async function deletePost(user, postId) {
  const post = await Post.findById(postId);
  if (!post) return { error: "Post not found" };
  if (String(post.authorId) !== String(user._id)) return { error: "Not allowed" };

  await post.deleteOne();
  return { success: true };
}

module.exports = { createPost, getFeed, toggleLike, deletePost };
