const feedService = require("../services/feedService");

async function createPost(req, res) {
  try {
    const post = await feedService.createPost(req.user, req.body);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

async function getFeed(req, res) {
  try {
    const posts = await feedService.getFeed();
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

async function toggleLike(req, res) {
  try {
    const post = await feedService.toggleLike(req.user, req.params.id);
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

async function deletePost(req, res) {
  try {
    const result = await feedService.deletePost(req.user, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
};

async function getPersonalizedFeed(req, res) {
  try {
    const posts = await feedService.getPersonalizedFeed(req.user._id);
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

async function addComment(req, res) {
  try {
    const comment = await feedService.addComment(req.user._id, req.params.id, req.body.text);
    res.json({ success: true, data: comment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

async function getComments(req, res) {
  try {
    const { page = 1, limit = 5 } = req.query;
    const comments = await feedService.getComments(req.params.id, page, limit);
    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};


module.exports = { createPost, getFeed, toggleLike, deletePost, getPersonalizedFeed, addComment, getComments };
