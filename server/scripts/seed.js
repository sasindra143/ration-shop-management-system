const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const Stock = require('../models/Stock');
const RationCard = require('../models/RationCard');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Create Admin
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      await Admin.create({
        username: 'admin',
        password: 'admin123',
        name: 'Shop Manager',
        role: 'admin',
        shopNumber: '0806015'
      });
      console.log('✅ Admin user created (admin / admin123)');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // 2. Initialize Stock
    const stockExists = await Stock.findOne({ shopNumber: '0806015' });
    if (!stockExists) {
      await Stock.create({
        shopNumber: '0806015',
        rice: 5000,
        wheat: 1000,
        sugar: 200,
        kerosene: 500,
        dall: 300
      });
      console.log('✅ Initial stock initialized for shop 0806015');
    } else {
      console.log('ℹ️ Stock already exists');
    }

    // 3. Add a few Sample Ration Cards if none exist
    const cardsCount = await RationCard.countDocuments();
    if (cardsCount === 0) {
      const sampleCards = [
        {
          cardNumber: '2822595811',
          headOfFamily: 'Venkataiah',
          headOfFamilyTelugu: 'వెంకటయ్య',
          familyMembers: 4,
          category: 'PHH',
          address: 'Sunkesula Village',
          mobile: '9876543210'
        },
        {
          cardNumber: '2822595812',
          headOfFamily: 'Laxmi',
          headOfFamilyTelugu: 'లక్ష్మి',
          familyMembers: 3,
          category: 'BPL',
          address: 'Sunkesula Village',
          mobile: '9876543211'
        }
      ];
      await RationCard.insertMany(sampleCards);
      console.log('✅ Sample ration cards added');
    }

    console.log('Data seeding completed successfully!');
    process.exit();
  } catch (error) {
    const fs = require('fs');
    console.error('Error seeding data:', error);
    let errorMsg = error.stack;
    if (error.errors) {
      errorMsg += '\nValidation errors: ' + JSON.stringify(error.errors, null, 2);
    }
    fs.writeFileSync('seed_error.log', errorMsg);
    process.exit(1);
  }
};

seedData();
