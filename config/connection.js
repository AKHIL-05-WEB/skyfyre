
// config/connection.js
const { MongoClient } = require('mongodb');

let db;

const connectDB = async () => {
  try {
    const client = await MongoClient.connect("mongodb://localhost:27017");
    db = client.db('mydatabase'); // Use your DB name here
    console.log('✅ MongoDB Connected!');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
};

module.exports = { connectDB, getDB };


