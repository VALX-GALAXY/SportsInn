const feedService = require("../services/feedService");
const io = require("../server")?.get?.("io"); // not used here — we get io from req.app in runtime

async function uploadMedia(req, res) {
  try {
    // multer placed file on req.file
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const { url, type } = await feedService.uploadFile(file);
    res.json({ success: true, data: { url, mediaType: type } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const posts = await feedService.getFeed(page, limit);
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

async function likePost(req, res) {
  try {
    const io = req.app.get("io");
    const result = await feedService.likePost(req.user, req.params.id, io);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function unlikePost(req, res) {
  try {
    const result = await feedService.unlikePost(req.user, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}


async function toggleLike(req, res) {
  try {
    const io = req.app.get("io");
    const result = await feedService.toggleLike(req.user, req.params.id, io);
    res.json({ success: true, data: result });
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
    const io = req.app.get("io");
    const comment = await feedService.addComment(req.user, req.params.id, req.body.text, io);
    res.json({ success: true, data: comment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function getComments(req, res) {
  try {
    const { page = 1, limit = 5 } = req.query;
    const comments = await feedService.getComments(req.params.id, page, limit);
    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

module.exports = {
  uploadMedia,
  createPost,
  getFeed,
  likePost,
  unlikePost,
  toggleLike,
  deletePost,
  getPersonalizedFeed,
  addComment,
  getComments
};
