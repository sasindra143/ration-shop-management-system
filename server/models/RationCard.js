const mongoose = require('mongoose');

const RationCardSchema = new mongoose.Schema({
  serialNumber: { type: Number },                                     // S.NO from PDF
  cardNumber: { type: String, required: true, unique: true, trim: true },
  headOfFamily: { type: String, required: true, trim: true },      // English name
  headOfFamilyTelugu: { type: String, trim: true },                 // Telugu name
  address: { type: String, trim: true },
  familyMembers: { type: Number, required: true, min: 1 },          // "units"
  category: { type: String, enum: ['APL', 'BPL', 'Antyodaya', 'PHH'], default: 'PHH' },
  mduCode: { type: String, default: 'PR06006' },
  shopNumber: { type: String, default: '0806015' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Text index for search
RationCardSchema.index({ headOfFamily: 'text', headOfFamilyTelugu: 'text', cardNumber: 'text' });

module.exports = mongoose.model('RationCard', RationCardSchema);
