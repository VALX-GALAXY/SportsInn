const Report = require('../models/reportModel');

async function createReport(req, res) {
  try {
    const { postId, reason } = req.body;
    if (!postId || !reason) return res.status(400).json({ success: false, message: 'postId and reason required' });

    const report = await Report.create({
      postId,
      reason,
      reporterId: req.user._id
    });

    res.status(201).json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getAllReports(req, res) {
  try {
    const reports = await Report.find().populate('reporterId', 'name email').populate('postId');
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { createReport, getAllReports };