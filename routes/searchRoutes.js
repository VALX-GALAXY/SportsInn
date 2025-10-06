const express = require('express');
const router = express.Router();
const { searchUsers } = require('../controllers/searchController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, searchUsers);

module.exports = router;
