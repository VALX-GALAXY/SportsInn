const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware'); // we'll export adminOnly from here
const reportController = require('../controllers/reportController');

router.post('/', auth, reportController.createReport);
router.get('/', auth, role.adminOnly, reportController.getAllReports);

module.exports = router;