// models/SystemLog.js
const mongoose = require('mongoose');

const SystemLogSchema = new mongoose.Schema({
    cpuUsage: Number,
    gpuUsage: Number,
    hbmUsage: Number,
    totalMemory: Number,
    usedMemory: Number,
    totalStorage: Number, // Total storage in GB
    usedStorage: Number,  // Used storage in GB
    storageUsage: Number, // Storage usage percentage
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemLog', SystemLogSchema);
