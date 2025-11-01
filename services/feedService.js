// services/feedService.js
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const redis = require("../utils/redisClient");
const DEFAULT_TTL = Number(process.env.FEED_CACHE_TTL) || 30;

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

/**
 * Try to delete all feed:* keys using SCAN (safe for production).
 * Gracefully returns when Redis unavailable.
 */
async function invalidateFeedCache() {
  try {
    const client = redis.getClient && redis.getClient();
    if (!client) return;

    // use scanIterator if available (node-redis v4 supports scanIterator)
    if (typeof client.scanIterator === "function") {
      const batch = [];
      for await (const key of client.scanIterator({ MATCH: "feed:*", COUNT: 100 })) {
        batch.push(key);
        if (batch.length >= 100) {
          // prefer UNLINK (non-blocking) then fall back to DEL
          try { await client.unlink(...batch); } catch (e) { await client.del(...batch); }
          batch.length = 0;
        }
      }
      if (batch.length) {
        try { await client.unlink(...batch); } catch (e) { await client.del(...batch); }
      }
    } else {
      // fallback: try KEYS (not recommended for huge prod datasets) but safe as fallback
      const keys = await client.keys("feed:*").catch(() => []);
      if (keys && keys.length) {
        try { await client.unlink(...keys); } catch (e) { await client.del(...keys); }
      }
    }
  } catch (err) {
    // do not throw — cache invalidation failure should not break flow
    console.warn("Redis invalidate error:", err && err.message ? err.message : err);
  }
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
  // invalidate cache after DB write
  invalidateFeedCache();
  
  // Populate authorId before returning to match frontend expectations
  const populatedPost = await Post.findById(post._id)
    .populate("authorId", "name role profilePic")
    .lean();
  
  // Ensure we return a properly structured post with populated author
  return {
    _id: populatedPost._id,
    authorId: populatedPost.authorId ? {
      _id: populatedPost.authorId._id,
      name: populatedPost.authorId.name || user.name || 'Unknown User',
      role: populatedPost.authorId.role || user.role || '',
      profilePic: populatedPost.authorId.profilePic || user.profilePic || null
    } : {
      _id: user._id,
      name: user.name || 'Unknown User',
      role: user.role || '',
      profilePic: user.profilePic || null
    },
    role: populatedPost.role || user.role || '',
    caption: populatedPost.caption || "",
    mediaUrl: populatedPost.mediaUrl || null,
    mediaType: populatedPost.mediaType || null,
    likes: populatedPost.likes || [],
    comments: populatedPost.comments || [],
    createdAt: populatedPost.createdAt,
    updatedAt: populatedPost.updatedAt
  };
}

async function getFeed(filters = {}, page = 1, limit = 10) {
  const role = filters.role || "";
  const type = filters.type || "";
  const key = `feed:role=${role}:type=${type}:page=${page}:limit=${limit}`;

  // try cache (redis.get returns parsed object or null)
  try {
    if (redis && typeof redis.get === "function") {
      const cached = await redis.get(key);
      if (cached) {
        return cached;
      }
    }
  } catch (err) {
    console.warn("Redis read error:", err && err.message ? err.message : err);
    // continue to DB
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

  // write cache using helper (redis.set will stringify)
  try {
    if (redis && typeof redis.set === "function") {
      await redis.set(key, result, DEFAULT_TTL);
    }
  } catch (err) {
    console.warn("Redis write error:", err && err.message ? err.message : err);
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
    invalidateFeedCache();
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

  // Get the saved post with populated comment userId and convert to plain object
  const populatedPost = await Post.findById(postId)
    .populate("comments.userId", "name role profilePic")
    .lean(); // Use lean() to get plain JavaScript objects instead of Mongoose documents
  
  const savedComment = populatedPost.comments[populatedPost.comments.length - 1];
  
  // Check if userId was properly populated (should be an object, not just an ObjectId)
  let populatedUserId = null;
  if (savedComment.userId && typeof savedComment.userId === 'object' && savedComment.userId._id) {
    // userId is properly populated
    populatedUserId = {
      _id: savedComment.userId._id,
      name: savedComment.userId.name || user.name || 'Unknown User',
      role: savedComment.userId.role || user.role || '',
      profilePic: savedComment.userId.profilePic || user.profilePic || null
    };
  } else {
    // userId not populated, use user info directly
    populatedUserId = {
      _id: user._id,
      name: user.name || 'Unknown User',
      role: user.role || '',
      profilePic: user.profilePic || null
    };
  }
  
  // Ensure we return a plain object with proper structure
  const commentToReturn = {
    _id: savedComment._id,
    userId: populatedUserId,
    text: savedComment.text,
    createdAt: savedComment.createdAt
  };

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

  return commentToReturn;
}

async function getComments(postId, page = 1, limit = 5) {
  const post = await Post.findById(postId).populate("comments.userId", "name role profilePic");
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