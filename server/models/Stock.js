const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  shopNumber: { type: String, default: '0806015' },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  rice: { type: Number, default: 0 },
  bigSoap: { type: Number, default: 0 },
  smallSoap: { type: Number, default: 0 },
  wheat: { type: Number, default: 0 },
  idli: { type: Number, default: 0 },
  samiya: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  surf: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure one stock document per month/year per shop
StockSchema.index({ shopNumber: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Stock', StockSchema);
