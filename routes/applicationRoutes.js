const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const appCtrl = require('../controllers/applicationController');

router.post('/', auth, appCtrl.createApplication);
router.get('/sent', auth, appCtrl.getSentApplications);
router.get('/received', auth, appCtrl.getReceivedApplications);
router.put('/:id', auth, appCtrl.updateApplicationStatus);

module.exports = router;
