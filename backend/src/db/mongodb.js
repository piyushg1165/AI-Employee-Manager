const mongoose = require('mongoose');


require('dotenv').config();

const connectDB = async ( ) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Mongodb connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

module.exports =  {connectDB} ;

// import { MongoClient } from 'mongodb';

// const mongoClient = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });
// await mongoClient.connect();
// const db = mongoClient.db(process.env.MONGO_DB || 'chatdb');
// export const chats = db.collection('chats');