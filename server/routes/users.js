const express = require('express');
const router = express.Router();
const RationCard = require('../models/RationCard');
const Transaction = require('../models/Transaction');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/users - List all cards with search/filter
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, status, month, year, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { cardNumber: { $regex: search, $options: 'i' } },
        { headOfFamily: { $regex: search, $options: 'i' } },
        { headOfFamilyTelugu: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'received' || status === 'pending') {
      const m = parseInt(month) || new Date().getMonth() + 1;
      const y = parseInt(year) || new Date().getFullYear();
      const txs = await Transaction.find({ month: m, year: y }).select('cardNumber');
      const receivedCardNumbers = txs.map(t => t.cardNumber);

      if (status === 'received') {
        query.cardNumber = { ...query.cardNumber, $in: receivedCardNumbers };
      } else if (status === 'pending') {
        query.cardNumber = { ...query.cardNumber, $nin: receivedCardNumbers };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [cards, total] = await Promise.all([
      RationCard.find(query).sort({ serialNumber: 1, headOfFamily: 1 }).skip(skip).limit(parseInt(limit)),
      RationCard.countDocuments(query),
    ]);
    res.json({ cards, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/all - For dropdown (all active cards)
router.get('/all', protect, async (req, res) => {
  try {
    const cards = await RationCard.find({ isActive: true }).select('cardNumber headOfFamily headOfFamilyTelugu familyMembers').sort({ cardNumber: 1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/:id - Get single card
router.get('/:id', protect, async (req, res) => {
  try {
    const card = await RationCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/card/:cardNumber - Get by card number
router.get('/card/:cardNumber', protect, async (req, res) => {
  try {
    const card = await RationCard.findOne({ cardNumber: req.params.cardNumber });
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users - Add new card holder
router.post('/', protect, async (req, res) => {
  try {
    const card = await RationCard.create(req.body);
    res.status(201).json(card);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Card number already exists' });
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/users/:id - Update card holder
router.put('/:id', protect, async (req, res) => {
  try {
    const card = await RationCard.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.json(card);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/users/:id - Admin only (soft delete)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const card = await RationCard.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.json({ message: 'Card deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
