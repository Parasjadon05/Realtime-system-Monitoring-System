const mongoose = require('mongoose');

const connectDB = async ()=>{
    try {
        mongoose.connect('mongodb://localhost:27017/systemMonitoring');
        console.log("DB connected");
    } catch (error) {
        console.log("Error in connecting", error);
    }
}

module.exports = connectDB;