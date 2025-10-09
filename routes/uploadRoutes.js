const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const uploadCtrl = require('../controllers/uploadController');

router.post('/', auth, uploadCtrl.uploadMiddleware(), uploadCtrl.handleUpload);

module.exports = router;