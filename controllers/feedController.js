const { getMockFeed } = require("../services/feedService");

function getFeed(req, res) {
  const posts = getMockFeed();
  return res.json({ success: true, data: posts, message: "Feed fetched" });
}

module.exports = { getFeed };
