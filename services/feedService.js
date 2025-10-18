const Post = require("../models/postModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const redisClient = require("../utils/redisClient");
const DEFAULT_TTL = Number(process.env.FEED_CACHE_TTL) || 30;

async function invalidateFeedCache() {
  if (!redisClient) return;
  try {
    // if Redis supports KEYS in your environment; in prod you'd use a proper pattern or track keys
    const keys = await redisClient.keys("feed:*");
    if (keys.length) await redisClient.del(keys);
  } catch (err) {
    console.warn("Redis invalidate error:", err.message || err);
  }
}

// Cloudinary
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

// configure cloudinary if env present
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadFile(file) {
  // file from multer: file.path
  if (!file) throw new Error("No file provided");

  // if cloudinary configured, upload there
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    const res = await cloudinary.uploader.upload(file.path, { resource_type: "auto" });
    // remove local file
    fs.unlinkSync(file.path);
    return { url: res.secure_url, type: res.resource_type };
  }

  // fallback: local URL
  const url = `${process.env.BASE_URL || "http://localhost:3000"}/uploads/${path.basename(file.path)}`;
  return { url, type: file.mimetype.startsWith("video") ? "video" : "image" };
}



async function createPost(user, body) {
  const post = new Post({
    authorId: user._id,
    role: user.role,
    caption: body.caption || "",
    mediaUrl: body.mediaUrl || null,
    mediaType: body.mediaType || null,
    likes: []
  });
  await post.save();
  invalidateFeedCache();
  return post;
}

async function getFeed(filters = {}, page = 1, limit = 10) {
  const role = filters.role || "";
  const type = filters.type || "";
  const key = `feed:role=${role}:type=${type}:page=${page}:limit=${limit}`;

  // try cache
  if (redisClient) {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      // log, but continue to DB
      console.warn("Redis read error:", err.message || err);
    }
  }

  // build mongo query
  const q = {};
  if (filters.role) q.role = filters.role;
  if (filters.type) {
    if (filters.type === "text") q.mediaUrl = { $in: [null, ""] };
    else if (filters.type === "image") q.mediaType = "image";
    else if (filters.type === "video") q.mediaType = "video";
  }

  const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
  const docs = await Post.find(q)
    .populate("authorId", "name role profilePic")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit) + 1);

  const hasMore = docs.length > limit;
  const paged = hasMore ? docs.slice(0, limit) : docs;
  const nextPage = hasMore ? page + 1 : null;

  const result = {
    page,
    limit: Number(limit),
    hasMore,
    nextPage,
    data: paged
  };

  // write cache
  if (redisClient) {
    try {
      await redisClient.setEx(key, DEFAULT_TTL, JSON.stringify(result));
    } catch (err) {
      console.warn("Redis write error:", err.message || err);
    }
  }

  return result;
}

async function likePost(user, postId, io) {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  // add if not already liked
  if (!post.likes.includes(user._id)) {
    post.likes.push(user._id);
    invalidateFeedCache();
    await post.save();

    // create notification
    if (String(post.authorId) !== String(user._id)) {  // don't notify self-likes
      const note = await Notification.create({
        userId: post.authorId,
        type: "like",
        fromUserId: user._id,
        postId: post._id,
        read: false
      });

      // emit socket event to post author room
      if (io) io.to(String(post.authorId)).emit("notification:new", note);
    }
  }
  return { likesCount: post.likes.length };
}


async function unlikePost(user, postId) {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  const idx = post.likes.indexOf(user._id);
  if (idx >= 0) {
    post.likes.splice(idx, 1);
    await post.save();
    // optionally remove like notifications - skipped for simplicity
  }
  return { likesCount: post.likes.length };
}

async function toggleLike(user, postId, io) {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  if (post.likes.includes(user._id)) {
    return unlikePost(user, postId);
  } else {
    return likePost(user, postId, io);
  }
}

async function deletePost(user, postId) {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");
  if (String(post.authorId) !== String(user._id)) throw new Error("Not allowed");

  await post.deleteOne();
  invalidateFeedCache();
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

async function getPostsByUser(userId, page = 1, limit = 10) {
  const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
  const docs = await Post.find({ authorId: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
  return docs;
}

async function addComment(user, postId, text, io) {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  const comment = { userId: user._id, text, createdAt: new Date() };  
  post.comments.push(comment);
  invalidateFeedCache();
  await post.save();

  // notification to author
  if (String(post.authorId) !== String(user._id)) {
    const note = await Notification.create({
      userId: post.authorId,
      type: "comment",
      fromUserId: user._id,
      postId: post._id,
      read: false
    });
    if (io) io.to(String(post.authorId)).emit("notification:new", note);
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
  uploadFile,
  createPost,
  getFeed,
  likePost,
  unlikePost,
  toggleLike,
  deletePost,
  getPersonalizedFeed,
  getPostsByUser,
  addComment,
  getComments
};
