const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['applied','selected','rejected'], default: 'applied' },
  appliedAt: { type: Date, default: Date.now },
  decidedAt: { type: Date }
}, { _id: true });

const tournamentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  entryFee: { type: Number, default: 0 },
  location: { type: String },
  type: { type: String }, // free text or enum if you want
  vacancies: { type: Number, default: 0 },
  deadline: { type: Date }, // optional application deadline
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [applicantSchema]
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);