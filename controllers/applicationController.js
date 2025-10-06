const Application = require('../models/applicationModel');
const User = require('../models/userModel');

// POST /api/applications
// body: { toUserId }  (player -> apply to academy/scout OR academy/scout -> invite)
async function createApplication(req, res) {
  try {
    const fromUserId = req.user._id;
    const { toUserId } = req.body;
    if (!toUserId) return res.status(400).json({ success: false, message: 'toUserId required' });

    // role guard: only players can "apply"; academies/scouts can also create invites (allow both)
    // We'll accept creation but business rule enforcement may occur elsewhere.
    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(404).json({ success: false, message: 'Recipient not found' });

    const app = await Application.create({ fromUserId, toUserId, status: 'pending' });
    res.status(201).json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/applications/sent
async function getSentApplications(req, res) {
  try {
    const apps = await Application.find({ fromUserId: req.user._id }).populate('toUserId', 'name email role');
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/applications/received
async function getReceivedApplications(req, res) {
  try {
    const apps = await Application.find({ toUserId: req.user._id }).populate('fromUserId', 'name email role');
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/applications/:id  body: { status: 'accepted'|'rejected' }
async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending','accepted','rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const app = await Application.findById(id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    // only recipient (toUserId) or admin can update
    if (String(app.toUserId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }

    app.status = status;
    await app.save();
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { createApplication, getSentApplications, getReceivedApplications, updateApplicationStatus };
