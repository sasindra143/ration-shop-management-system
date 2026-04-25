const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  cardNumber: { type: String, required: true, ref: 'RationCard' },
  headOfFamily: { type: String },
  familyMembers: { type: Number },
  date: { type: Date, default: Date.now },
  month: { type: Number, required: true },   // 1-12
  year: { type: Number, required: true },
  shopNumber: { type: String, default: '0806015' },
  rice: { type: Number, default: 0 },
  bigSoap: { type: Number, default: 0 },
  smallSoap: { type: Number, default: 0 },
  wheat: { type: Number, default: 0 },
  idli: { type: Number, default: 0 },
  samiya: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  surf: { type: Number, default: 0 },
  totalBill: { type: Number, default: 0 },
  enteredBy: { type: String },
  receiverName: { type: String },          // who physically collected
  receiverPhoto: { type: String },         // base64 photo of receiver
}, { timestamps: true });

// Prevent duplicate entry for same card in same month/year
TransactionSchema.index({ cardNumber: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
