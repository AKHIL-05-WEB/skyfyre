const { MongoClient } = require('mongodb');

let db;

const connectDB = async () => {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URI); // Use environment variable
    db = client.db('shopping_cart'); // Use your DB name here
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

};

module.exports = { connectDB, getDB };


