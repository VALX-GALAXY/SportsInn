const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  entryFee: { type: Number, default: 0 },
  location: { type: String },
  type: { type: String }, // e.g., "league", "knockout"
  vacancies: { type: Number, default: 0 },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' , required: true},
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);