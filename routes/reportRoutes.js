const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const reportController = require('../controllers/reportController');

// Create report
router.post('/', auth, reportController.createReport);

// Get all reports (admin only)
router.get('/', auth, role.adminOnly, reportController.getAllReports);

// Update report status (admin only)
router.put('/:id', auth, role.adminOnly, reportController.updateReportStatus);

// Get report stats (admin only)
router.get('/stats', auth, role.adminOnly, reportController.getReportStats);

module.exports = router;