const express = require('express');
const router = express.Router();
const si = require('systeminformation');
const SystemLog = require('../models/SystemLog');

// Route to get real-time system data (macOS-friendly)
router.get('/stats', async (req, res) => {
    try {
        const cpuData = await si.currentLoad(); // Get CPU load
        const memData = await si.mem();         // Get memory usage
        const fsData = await si.fsSize();       // Get file system storage info

        // Mock GPU and HBM data (since it's not available on macOS M1)
        const mockGpuUsage = Math.floor(Math.random() * 100);
        const mockHbmUsage = Math.floor(Math.random() * 100);

        // Assuming you want to monitor the first storage drive
        const storageData = {
            totalStorage: (fsData[0].size / (1024 ** 3)).toFixed(2),    // Total storage in GB
            usedStorage: ((fsData[0].used / fsData[0].size) * 100).toFixed(2)  // Storage usage percentage
        };

        const systemData = {
            cpuUsage: cpuData.currentLoad.toFixed(2),                   // CPU usage percentage
            totalMemory: (memData.total / (1024 ** 3)).toFixed(2),       // Total memory in GB
            usedMemory: ((memData.used / memData.total) * 100).toFixed(2), // Memory usage percentage
            gpuUsage: mockGpuUsage,                                      // Mock GPU usage
            hbmUsage: mockHbmUsage,                                      // Mock HBM usage
            totalStorage: storageData.totalStorage,                      // Total storage in GB
            usedStorage: storageData.usedStorage                         // Storage usage percentage
        };

        // Optionally store the log in MongoDB
        // const log = new SystemLog(systemData);
        // await log.save();

        // Send the system data back to the client
        res.json(systemData);
    } catch (error) {
        console.error('Error fetching system data:', error);
        res.status(500).json({ message: 'Error fetching system data', error: error.toString() });
    }
});

// Route to get system data logs (for historical data)
router.get('/logs', async (req, res) => {
    try {
        const logs = await SystemLog.find().sort({ timestamp: -1 }).limit(100); // Get the latest 100 logs
        res.json(logs);
    } catch (error) {
        console.error('Error fetching system logs:', error);
        res.status(500).json({ message: 'Error fetching system logs', error: error.toString() });
    }
});

module.exports = router;
