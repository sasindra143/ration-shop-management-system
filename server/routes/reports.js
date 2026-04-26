const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const RationCard = require('../models/RationCard');
const { protect } = require('../middleware/auth');

// GET /api/reports/monthly - Monthly distribution totals
router.get('/monthly', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const totals = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          totalCards: { $sum: 1 },
          totalFamilyMembers: { $sum: '$familyMembers' },
          totalRice: { $sum: '$rice' },
          totalBigSoap: { $sum: '$bigSoap' },
          totalSmallSoap: { $sum: '$smallSoap' },
          totalWheat: { $sum: '$wheat' },
          totalIdli: { $sum: '$idli' },
          totalSamiya: { $sum: '$samiya' },
          totalSugar: { $sum: '$sugar' },
          totalSurf: { $sum: '$surf' },
          totalBill: { $sum: '$totalBill' }
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    res.json(totals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reports/monthly-detail - Detailed monthly list for PDF
router.get('/monthly-detail', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    const transactions = await Transaction.find(query).sort({ headOfFamily: 1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reports/dashboard - Dashboard summary stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    const now = new Date();
    // Use query params if provided, else current month
    const currentMonth = parseInt(req.query.month) || now.getMonth() + 1;
    const currentYear = parseInt(req.query.year) || now.getFullYear();

    const [totalCards, todayCount, monthlyCount, monthlyTotals, last6Months] = await Promise.all([
      RationCard.countDocuments({ isActive: true }),
      Transaction.countDocuments({
        createdAt: { $gte: new Date(now.toDateString()) }
      }),
      Transaction.countDocuments({ month: currentMonth, year: currentYear }),
      Transaction.aggregate([
        { $match: { month: currentMonth, year: currentYear } },
        { $group: { _id: null, rice: { $sum: '$rice' }, bigSoap: { $sum: '$bigSoap' }, smallSoap: { $sum: '$smallSoap' }, wheat: { $sum: '$wheat' }, idli: { $sum: '$idli' }, samiya: { $sum: '$samiya' }, sugar: { $sum: '$sugar' }, surf: { $sum: '$surf' }, totalBill: { $sum: '$totalBill' } } }
      ]),
      Transaction.aggregate([
        {
          $group: {
            _id: { month: '$month', year: '$year' },
            count: { $sum: 1 },
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ])
    ]);

    // Fetch received transactions for the month to build pending/received lists
    const receivedTransactions = await Transaction.find({ month: currentMonth, year: currentYear })
      .select('cardNumber headOfFamily date -_id')
      .sort({ date: -1 });
    const receivedCardNumbers = receivedTransactions.map(t => t.cardNumber);
    const pendingCardsList = await RationCard.find({ cardNumber: { $nin: receivedCardNumbers }, isActive: true })
      .select('serialNumber cardNumber headOfFamily -_id')
      .sort({ serialNumber: 1, headOfFamily: 1 });

    res.json({
      totalCards,
      todayDistributions: todayCount,
      monthlyDistributions: monthlyCount,
      pendingCards: totalCards - monthlyCount,
      monthlyTotals: monthlyTotals[0] || {},
      last6Months,
      receivedList: receivedTransactions,
      pendingList: pendingCardsList
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
