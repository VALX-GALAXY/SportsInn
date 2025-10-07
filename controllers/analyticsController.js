// GET /api/analytics/player/:id
function playerAnalytics(req, res) {
  // return dummy/mock values
  const data = {
    matches: 42,
    runs: 2450,
    wickets: 30
  };
  res.json({ success: true, data });
}

// GET /api/analytics/academy/:id
function academyAnalytics(req, res) {
  const data = {
    trainees: 120,
    openSlots: 5
  };
  res.json({ success: true, data });
}

// GET /api/analytics/scout/:id
function scoutAnalytics(req, res) {
  const data = {
    applicationsReviewed: 87
  };
  res.json({ success: true, data });
}

module.exports = { playerAnalytics, academyAnalytics, scoutAnalytics };
