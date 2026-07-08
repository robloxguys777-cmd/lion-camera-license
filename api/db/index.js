const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not set, skipping MongoDB connection.');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// You'll define your License model here later, for example:
// const License = mongoose.model('License', new mongoose.Schema({
//   key: { type: String, required: true, unique: true },
//   discordId: { type: String, required: true },
//   productId: { type: String, required: true },
//   status: { type: String, required: true, default: 'active' },
//   createdAt: { type: Date, default: Date.now }
// }));

module.exports = { connectDB };
