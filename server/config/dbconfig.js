const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async()=>{
    try {
        console.log('connecting to mongodb');
        await mongoose.connect(process.env.DATABASE_URI);
    } catch (error) {
        console.error(error);
    }
}

module.exports = connectDB;