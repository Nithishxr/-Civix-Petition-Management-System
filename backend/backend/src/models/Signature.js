const mongoose = require('mongoose');
const signatureSchema = new mongoose.Schema({
  petition_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Petition', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now }
});
signatureSchema.index({ petition_id: 1, user_id: 1 }, { unique: true });
module.exports = mongoose.model('Signature', signatureSchema);