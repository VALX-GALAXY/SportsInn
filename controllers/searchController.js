const User = require('../models/userModel');
const Post = require('../models/postModel');
const Tournament = require('../models/tournamentModel');
const redis = require('../utils/redisClient');

const SEARCH_CACHE_TTL = 300; // 5 minutes

// GET /api/search
// Enhanced search with Redis caching and multiple entity types
async function searchUsers(req, res) {
  try {
    const {
      q, // search query
      type = 'all', // 'users', 'posts', 'tournaments', 'all'
      role,
      location,
      ageMin,
      ageMax,
      page = 1,
      limit = 10
    } = req.query;

    // Create cache key
    const cacheKey = `search:${type}:${q || 'all'}:${role || 'all'}:${location || 'all'}:${ageMin || 'all'}:${ageMax || 'all'}:${page}:${limit}`;

    // Try to get from cache first
    try {
      if (redis && typeof redis.get === 'function') {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return res.json({ success: true, data: cached, cached: true });
        }
      }
    } catch (err) {
      console.warn('Redis search cache read error:', err.message);
    }

    let results = {};

    // Search users
    if (type === 'users' || type === 'all') {
      const userQuery = {};
      
      if (q) {
        userQuery.$or = [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { bio: { $regex: q, $options: 'i' } }
        ];
      }
      
      if (role) userQuery.role = role;
      if (location) userQuery.location = { $regex: location, $options: 'i' };
      if (ageMin || ageMax) {
        userQuery.age = {};
        if (ageMin) userQuery.age.$gte = Number(ageMin);
        if (ageMax) userQuery.age.$lte = Number(ageMax);
      }

      const users = await User.find(userQuery)
        .select('-passwordHash -refreshTokens')
        .sort({ name: 1 })
        .limit(Number(limit))
        .lean();

      results.users = users;
    }

    // Search posts
    if (type === 'posts' || type === 'all') {
      const postQuery = {};
      
      if (q) {
        postQuery.$or = [
          { caption: { $regex: q, $options: 'i' } }
        ];
      }

      const posts = await Post.find(postQuery)
        .populate('authorId', 'name role profilePic')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();

      results.posts = posts;
    }

    // Search tournaments
    if (type === 'tournaments' || type === 'all') {
      const tournamentQuery = {};
      
      if (q) {
        tournamentQuery.$or = [
          { title: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } },
          { type: { $regex: q, $options: 'i' } }
        ];
      }

      const tournaments = await Tournament.find(tournamentQuery)
        .populate('createdBy', 'name role')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();

      results.tournaments = tournaments;
    }

    // Cache the results
    try {
      if (redis && typeof redis.set === 'function') {
        await redis.set(cacheKey, results, SEARCH_CACHE_TTL);
      }
    } catch (err) {
      console.warn('Redis search cache write error:', err.message);
    }

    res.json({ success: true, data: results, cached: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/search/autocomplete
// Autocomplete suggestions
async function getAutocompleteSuggestions(req, res) {
  try {
    const { q, type = 'users' } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const cacheKey = `autocomplete:${type}:${q}`;

    // Try cache first
    try {
      if (redis && typeof redis.get === 'function') {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return res.json({ success: true, data: cached, cached: true });
        }
      }
    } catch (err) {
      console.warn('Redis autocomplete cache read error:', err.message);
    }

    let suggestions = [];

    if (type === 'users') {
      const users = await User.find({
        $or: [
          { name: { $regex: `^${q}`, $options: 'i' } },
          { email: { $regex: `^${q}`, $options: 'i' } }
        ]
      })
      .select('name email role')
      .limit(5)
      .lean();

      suggestions = users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        type: 'user'
      }));
    } else if (type === 'tournaments') {
      const tournaments = await Tournament.find({
        title: { $regex: `^${q}`, $options: 'i' }
      })
      .select('title location type')
      .limit(5)
      .lean();

      suggestions = tournaments.map(tournament => ({
        id: tournament._id,
        title: tournament.title,
        location: tournament.location,
        type: tournament.type,
        searchType: 'tournament'
      }));
    }

    // Cache suggestions
    try {
      if (redis && typeof redis.set === 'function') {
        await redis.set(cacheKey, suggestions, 60); // 1 minute cache for autocomplete
      }
    } catch (err) {
      console.warn('Redis autocomplete cache write error:', err.message);
    }

    res.json({ success: true, data: suggestions, cached: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/search/trending
// Get trending searches and content
async function getTrendingContent(req, res) {
  try {
    const cacheKey = 'trending:content';

    // Try cache first
    try {
      if (redis && typeof redis.get === 'function') {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return res.json({ success: true, data: cached, cached: true });
        }
      }
    } catch (err) {
      console.warn('Redis trending cache read error:', err.message);
    }

    // Get trending tournaments (most applications)
    const trendingTournaments = await Tournament.aggregate([
      { $addFields: { applicantCount: { $size: '$applicants' } } },
      { $sort: { applicantCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'creator' } },
      { $unwind: '$creator' },
      { $project: { title: 1, location: 1, entryFee: 1, applicantCount: 1, creator: { name: 1, role: 1 } } }
    ]);

    // Get trending posts (most likes)
    const trendingPosts = await Post.aggregate([
      { $addFields: { likesCount: { $size: '$likes' } } },
      { $sort: { likesCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: 'authorId', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' },
      { $project: { caption: 1, likesCount: 1, author: { name: 1, role: 1, profilePic: 1 } } }
    ]);

    const trendingData = {
      tournaments: trendingTournaments,
      posts: trendingPosts
    };

    // Cache trending data
    try {
      if (redis && typeof redis.set === 'function') {
        await redis.set(cacheKey, trendingData, 600); // 10 minutes cache
      }
    } catch (err) {
      console.warn('Redis trending cache write error:', err.message);
    }

    res.json({ success: true, data: trendingData, cached: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { searchUsers, getAutocompleteSuggestions, getTrendingContent };
