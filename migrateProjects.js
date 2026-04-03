require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const Request = require('./models/Request');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URL);
  let qbay = await Project.findOne({ slug: 'q-bay' });
  if (!qbay) {
    qbay = await Project.create({
      name: 'Q Bay',
      slug: 'q-bay',
      rooms: ['أستوديو', 'أوضة و صالة', 'أوضتين و صالة', '3 أوض و صالة']
    });
    console.log('Created Q Bay project.');
  }

  const result = await Request.updateMany({ project: { $exists: false } }, { $set: { project: qbay._id } });
  console.log(`Migrated ${result.modifiedCount} requests to Q Bay.`);
  
  process.exit();
}
migrate();
