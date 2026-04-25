/**
 * Final import: captures serial number, card number, names, and derives 
 * familyMembers from rice quantity (units × 5 kg).
 */
const fs = require('fs');
const pdf = require('pdf-parse');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const RationCard = require('../models/RationCard');

async function importCards() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ration_shop');
    console.log('MongoDB Connected.');

    const pdfPath = '../cards.pdf.pdf';
    if (!fs.existsSync(pdfPath)) { console.log('PDF not found at', pdfPath); process.exit(1); }

    console.log('Reading PDF...');
    const text = (await pdf(fs.readFileSync(pdfPath))).text;
    console.log(`Extracted ${text.length} chars.`);

    // Regex to find: SERIALNO + CARDNO + names
    // Serial number directly precedes the card number (28xxxxxxxxxx)
    const cardRegex = /(\d{1,4})(28\d{8})\(([^)]+)\)\s*(.*?)\(([^)]+)\)\s*(\d+)/gs;
    const matches = [...text.matchAll(cardRegex)];
    console.log(`Found ${matches.length} card entries.`);

    const cards = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const serialNumber = parseInt(match[1], 10);
      const cardNumber = match[2].trim();
      const headOfFamilyTelugu = match[4].replace(/\s+/g, ' ').trim() || 'N/A';
      const headOfFamily = match[5].replace(/\s+/g, ' ').trim();

      // Get block between this match end and next card start
      const startPos = match.index + match[0].length;
      const endPos = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const block = text.substring(startPos, endPos);

      // First decimal number in block = rice qty; familyMembers = riceQty / 5
      const riceMatch = block.match(/(\d+\.\d+)/);
      let familyMembers = 1;

      if (riceMatch) {
        const riceQty = parseFloat(riceMatch[1]);
        const derived = Math.round(riceQty / 5);
        familyMembers = Math.min(9, Math.max(1, derived));
      } else {
        // Fallback: use captured digit group, capped
        let raw = parseInt(match[6], 10);
        if (raw > 9) raw = 1;
        familyMembers = Math.max(1, raw);
      }

      cards.push({
        serialNumber,
        cardNumber,
        headOfFamily,
        headOfFamilyTelugu,
        familyMembers,
        address: 'Sunkesula Village',
        category: 'PHH',
        isActive: true
      });
    }

    console.log(`\nParsed ${cards.length} cards.`);
    console.log('Sample 1:', JSON.stringify(cards[0]));
    console.log('Sample 2:', JSON.stringify(cards[1]));

    const dist = {};
    cards.forEach(c => { dist[c.familyMembers] = (dist[c.familyMembers] || 0) + 1; });
    console.log('\nFamily distribution:', dist);

    console.log('\nWriting to DB...');
    const bulkOps = cards.map(card => ({
      updateOne: {
        filter: { cardNumber: card.cardNumber },
        update: { $set: card },
        upsert: true
      }
    }));
    const result = await RationCard.bulkWrite(bulkOps);
    console.log(`✅ Done! Inserted: ${result.upsertedCount}, Updated: ${result.modifiedCount}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

importCards();
