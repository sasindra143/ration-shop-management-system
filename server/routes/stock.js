const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/stock - Get current stock for a specific month/year
router.get('/', protect, async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    let stock = await Stock.findOne({ shopNumber: '0806015', month, year });
    if (!stock) {
      stock = await Stock.create({ shopNumber: '0806015', month, year });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/stock - Add/update stock
router.post('/', protect, async (req, res) => {
  try {
    const { month, year, rice, soaps, wheat, idli, samiya, surf } = req.body;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    let stock = await Stock.findOne({ shopNumber: '0806015', month: m, year: y });
    if (!stock) {
      stock = new Stock({ shopNumber: '0806015', month: m, year: y });
    }
    
    if (rice !== undefined) stock.rice = (stock.rice || 0) + Number(rice);
    if (soaps !== undefined) stock.soaps = (stock.soaps || 0) + Number(soaps);
    if (wheat !== undefined) stock.wheat = (stock.wheat || 0) + Number(wheat);
    if (idli !== undefined) stock.idli = (stock.idli || 0) + Number(idli);
    if (samiya !== undefined) stock.samiya = (stock.samiya || 0) + Number(samiya);
    if (surf !== undefined) stock.surf = (stock.surf || 0) + Number(surf);
    
    stock.lastUpdated = new Date();
    await stock.save();
    res.json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
