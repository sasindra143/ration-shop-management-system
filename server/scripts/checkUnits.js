/**
 * Final cleanup: cap familyMembers at 9 for remaining corrupted records
 * and run a final verification.
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.');

  const coll = mongoose.connection.collection('rationcards');

  // Count bad records
  const bad = await coll.countDocuments({ familyMembers: { $gt: 9 } });
  console.log(`Cards with familyMembers > 9: ${bad}`);

  if (bad > 0) {
    // Show samples
    const samples = await coll.find({ familyMembers: { $gt: 9 } }).limit(5).toArray();
    console.log('Samples:', samples.map(c => `${c.cardNumber} ${c.headOfFamily} (${c.familyMembers})`));

    // Cap all at 9
    const result = await coll.updateMany(
      { familyMembers: { $gt: 9 } },
      { $set: { familyMembers: 9 } }
    );
    console.log(`Fixed ${result.modifiedCount} records → capped at 9.`);
  }

  // Final distribution
  const dist = await coll.aggregate([
    { $group: { _id: '$familyMembers', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]).toArray();

  console.log('\n✅ Final Family Member Distribution:');
  let totalFamilies = 0, totalMembers = 0;
  dist.forEach(d => {
    console.log(`  ${d._id} member(s): ${d.count} cards`);
    totalFamilies += d.count;
    totalMembers += d._id * d.count;
  });
  console.log(`\nTotal Cards: ${totalFamilies}`);
  console.log(`Total Family Members: ${totalMembers}`);
  console.log(`Average Family Size: ${(totalMembers / totalFamilies).toFixed(2)}`);

  process.exit(0);
}

cleanup().catch(err => { console.error(err); process.exit(1); });
