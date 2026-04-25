/**
 * Fix incorrect familyMembers values imported from PDF
 * The PDF regex sometimes captures address numbers alongside unit count.
 * E.g. unit=1, address=0000 → gets parsed as 10000
 * Rule: if familyMembers > 20, extract leading digits until value <= 20
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

function extractRealUnits(value) {
  if (value <= 20) return value;
  // Try taking just the first digit
  const str = String(value);
  for (let len = 1; len <= str.length; len++) {
    const candidate = parseInt(str.substring(0, len), 10);
    if (candidate >= 1 && candidate <= 20) {
      // Make sure next digit (if any) would make it >20
      if (len === str.length || parseInt(str.substring(0, len + 1), 10) > 20) {
        return candidate;
      }
    }
  }
  return 1; // fallback to 1 member
}

async function fixUnits() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ration_shop');
  console.log('Connected.');

  const coll = mongoose.connection.collection('rationcards');
  
  // Get all stats first
  const all = await coll.find({}).toArray();
  const above20 = all.filter(c => c.familyMembers > 20);
  const above100 = all.filter(c => c.familyMembers > 100);
  
  console.log('Total cards:', all.length);
  console.log('Cards with familyMembers > 20:', above20.length);
  console.log('Cards with familyMembers > 100:', above100.length);
  
  // Distribution
  const dist = {};
  all.forEach(c => {
    const key = c.familyMembers > 20 ? '>20' : String(c.familyMembers);
    dist[key] = (dist[key] || 0) + 1;
  });
  console.log('\nFamily member distribution:', dist);
  
  if (above20.length === 0) {
    console.log('\n✅ All records have valid familyMembers (<= 20). No fix needed!');
    process.exit(0);
  }
  
  console.log('\nSamples to fix:');
  above20.slice(0, 5).forEach(c => console.log(' ', c.cardNumber, c.headOfFamily, '→', c.familyMembers, '→', extractRealUnits(c.familyMembers)));
  
  // Fix them
  let fixed = 0;
  for (const card of above20) {
    const corrected = extractRealUnits(card.familyMembers);
    await coll.updateOne({ _id: card._id }, { $set: { familyMembers: corrected } });
    fixed++;
  }
  
  console.log(`\n✅ Fixed ${fixed} records.`);
  
  // Verify
  const stillBad = await coll.countDocuments({ familyMembers: { $gt: 20 } });
  console.log('Records still > 20:', stillBad);
  
  process.exit(0);
}

fixUnits().catch(err => { console.error(err); process.exit(1); });
