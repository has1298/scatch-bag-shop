const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const env = require('../config/env');
const connectDB = require('../config/db');
const Owner = require('../models/owner.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const productsData = require('./products.data');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const DAY = 24 * 60 * 60 * 1000;

async function seedOwner() {
  if (!env.OWNER_EMAIL || !env.OWNER_PASSWORD) {
    throw new Error('.env me OWNER_EMAIL aur OWNER_PASSWORD likhein');
  }

  let owner = await Owner.findOne({ email: env.OWNER_EMAIL.toLowerCase() });
  if (!owner) owner = new Owner({ email: env.OWNER_EMAIL });
  owner.fullname = env.OWNER_NAME;
  owner.password = env.OWNER_PASSWORD; 
  await owner.save();

  console.log(`Owner ready: ${owner.email}  (password: .env wala OWNER_PASSWORD)`);
  return owner;
}

async function seedProducts(owner) {
  await Product.deleteMany({});
  await User.updateMany({}, { $set: { cart: [] } });

  const now = Date.now();
  const docs = productsData.map(({ file, daysAgo, ...rest }) => {
    const filePath = path.join(IMAGES_DIR, file);
    if (!fs.existsSync(filePath)) throw new Error(`Image not founded: ${filePath}`);
    const created = new Date(now - daysAgo * DAY);
    return {
      ...rest,
      image: fs.readFileSync(filePath),
      imageType: 'image/png',
      createdBy: owner._id,
      createdAt: created,
      updatedAt: created,
    };
  });

  await Product.insertMany(docs, { timestamps: false });
  console.log(` ${docs.length} products added to MongoDB`);
}

(async () => {
  try {
    await connectDB();
    const owner = await seedOwner();
    await seedProducts(owner);
    console.log(' Seed complete!');
  } catch (err) {
    console.error(' Seed fail:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
