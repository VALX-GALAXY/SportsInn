const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['applied','selected','rejected'], default: 'applied' },
  appliedAt: { type: Date, default: () => new Date() },
  decidedAt: { type: Date }
}, { _id: true });

const tournamentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  entryFee: { type: Number, default: 0 },
  location: { type: String, default: "" },
  type: { type: String, default: "Open" }, // "Knockout","League", etc
  vacancies: { type: Number, default: 0 },
  deadline: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 3600 * 1000) }, // optional
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  applicants: [applicantSchema],
  status: { type: String, enum: ["Open", "Closed"], default: "Open" },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);