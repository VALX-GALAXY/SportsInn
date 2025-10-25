const express = require('express');
const router = express.Router();
const { searchUsers, getAutocompleteSuggestions, getTrendingContent } = require('../controllers/searchController');
const authMiddleware = require('../middlewares/authMiddleware');

// Main search endpoint
router.get('/', authMiddleware, searchUsers);

// Autocomplete suggestions
router.get('/autocomplete', authMiddleware, getAutocompleteSuggestions);

// Trending content
router.get('/trending', authMiddleware, getTrendingContent);

module.exports = router;
