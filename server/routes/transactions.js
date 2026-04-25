const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const RationCard = require('../models/RationCard');
const Stock = require('../models/Stock');
const { protect } = require('../middleware/auth');

// GET /api/transactions - List with filters
router.get('/', protect, async (req, res) => {
  try {
    const { month, year, cardNumber, page = 1, limit = 20 } = req.query;
    const query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (cardNumber) query.cardNumber = { $regex: cardNumber, $options: 'i' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Transaction.countDocuments(query),
    ]);
    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/transactions/:cardNumber - Card-wise history
router.get('/:cardNumber', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ cardNumber: req.params.cardNumber }).sort({ year: -1, month: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/transactions - New distribution entry
router.post('/', protect, async (req, res) => {
  try {
    const { cardNumber, month, year, rice, bigSoap, smallSoap, wheat, idli, samiya, sugar, surf, receiverName, receiverPhoto } = req.body;

    // Validate card exists
    const card = await RationCard.findOne({ cardNumber, isActive: true });
    if (!card) return res.status(404).json({ message: 'Ration card not found or inactive' });

    // Check stock availability for that month/year
    const stock = await Stock.findOne({ shopNumber: '0806015', month: parseInt(month), year: parseInt(year) });
    if (stock) {
      if ((stock.rice || 0) < (rice || 0)) return res.status(400).json({ message: `Insufficient rice stock. Available: ${stock.rice} kg` });
      if ((stock.bigSoap || 0) < (bigSoap || 0)) return res.status(400).json({ message: `Insufficient big soap stock. Available: ${stock.bigSoap}` });
      if ((stock.smallSoap || 0) < (smallSoap || 0)) return res.status(400).json({ message: `Insufficient small soap stock. Available: ${stock.smallSoap}` });
      if ((stock.wheat || 0) < (wheat || 0)) return res.status(400).json({ message: `Insufficient wheat stock. Available: ${stock.wheat} kg` });
      if ((stock.idli || 0) < (idli || 0)) return res.status(400).json({ message: `Insufficient idli rava stock. Available: ${stock.idli} kg` });
      if ((stock.samiya || 0) < (samiya || 0)) return res.status(400).json({ message: `Insufficient samiya stock. Available: ${stock.samiya} kg` });
      if ((stock.sugar || 0) < (sugar || 0)) return res.status(400).json({ message: `Insufficient sugar stock. Available: ${stock.sugar} kg` });
      if ((stock.surf || 0) < (surf || 0)) return res.status(400).json({ message: `Insufficient surf stock. Available: ${stock.surf} pkts` });
    }

    // Calculate total bill
    const s = Number(sugar) || 0;
    const sugarCost = Math.floor(s / 2) * 35 + (s % 2) * 17;
    const totalBill = 
      ((Number(bigSoap) || 0) * 20) +
      ((Number(smallSoap) || 0) * 10) +
      ((Number(wheat) || 0) * 50) +
      ((Number(idli) || 0) * 50) +
      ((Number(samiya) || 0) * 35) +
      ((Number(surf) || 0) * 45) +
      sugarCost;

    // Create transaction (will fail on unique index if duplicate)
    const transaction = await Transaction.create({
      cardNumber,
      headOfFamily: card.headOfFamily,
      familyMembers: card.familyMembers,
      month: parseInt(month),
      year: parseInt(year),
      shopNumber: '0806015',
      rice: rice || 0,
      bigSoap: bigSoap || 0,
      smallSoap: smallSoap || 0,
      wheat: wheat || 0,
      idli: idli || 0,
      samiya: samiya || 0,
      sugar: sugar || 0,
      surf: surf || 0,
      totalBill,
      enteredBy: req.user?.name || req.user?.username || 'Operator',
      receiverName: receiverName || '',
      receiverPhoto: receiverPhoto || '',
      date: new Date(),
    });

    // Deduct from stock
    if (stock) {
      stock.rice = (stock.rice || 0) - (rice || 0);
      stock.bigSoap = (stock.bigSoap || 0) - (bigSoap || 0);
      stock.smallSoap = (stock.smallSoap || 0) - (smallSoap || 0);
      stock.wheat = (stock.wheat || 0) - (wheat || 0);
      stock.idli = (stock.idli || 0) - (idli || 0);
      stock.samiya = (stock.samiya || 0) - (samiya || 0);
      stock.sugar = (stock.sugar || 0) - (sugar || 0);
      stock.surf = (stock.surf || 0) - (surf || 0);
      stock.lastUpdated = new Date();
      await stock.save();
    }

    res.status(201).json(transaction);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Distribution already entered for this card in the selected month/year.' });
    }
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/transactions/:id - Admin delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const tx = await Transaction.findByIdAndDelete(req.params.id);
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    // Restore stock
    await Stock.findOneAndUpdate({ shopNumber: '0806015', month: tx.month, year: tx.year }, {
      $inc: { rice: tx.rice, bigSoap: tx.bigSoap, smallSoap: tx.smallSoap, wheat: tx.wheat, idli: tx.idli, samiya: tx.samiya, sugar: tx.sugar, surf: tx.surf }
    });
    res.json({ message: 'Transaction deleted and stock restored' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
