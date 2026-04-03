require('dotenv').config();
const mongoose = require('mongoose');

async function drop() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await mongoose.connection.collection('visits').dropIndex('date_1');
    console.log('Index date_1 dropped successfully.');
  } catch (err) {
    console.error('Error dropping index:', err.message);
  }
  process.exit();
}
drop();
