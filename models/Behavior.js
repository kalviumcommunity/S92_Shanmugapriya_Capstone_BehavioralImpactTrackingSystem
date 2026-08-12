const mongoose = require('mongoose');

const behaviorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  behaviorType: { type: String, required: true },
  description: { type: String },
  impactScore: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Behavior', behaviorSchema);