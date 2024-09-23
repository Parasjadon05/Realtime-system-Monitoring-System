const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const si = require('systeminformation');
const connectDB = require('./db/connection');
const systemRoutes = require('./routes/system');
const SystemLog = require('./models/SystemLog'); // MongoDB model to store system logs

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
connectDB();

// Routes
app.use('/api/system', systemRoutes);

// WebSocket: Send real-time system data every 2 seconds to connected clients
wss.on('connection', ws => {
    console.log('New WebSocket client connected');

    let trainingProgress = 0; // Simulate ML training progress (0 to 100%)

    const interval = setInterval(async () => {
        try {
            const cpuData = await si.currentLoad(); // Get CPU load
            const memData = await si.mem();         // Get memory usage
            const fsData = await si.fsSize();       // Get file system storage info

            // Mock GPU and HBM data (since macOS M1 does not support real GPU monitoring)
            const mockGpuUsage = Math.floor(Math.random() * 100); // Mock GPU usage percentage
            const mockHbmUsage = Math.floor(Math.random() * 100); // Mock HBM usage percentage

            // Simulate training progress update
            trainingProgress = Math.min(trainingProgress + 5, 100); // Increment by 5% every 2 seconds

            // Prepare system data along with training progress
            const systemData = {
                cpuUsage: cpuData.currentLoad.toFixed(2),  // CPU usage percentage
                totalMemory: (memData.total / (1024 ** 3)).toFixed(2),  // Total memory in GB
                usedMemory: ((memData.used / memData.total) * 100).toFixed(2), // Memory usage percentage
                totalStorage: (fsData[0].size / (1024 ** 3)).toFixed(2), // Total storage in GB
                usedStorage: ((fsData[0].used / fsData[0].size) * 100).toFixed(2), // Storage usage percentage
                gpuUsage: mockGpuUsage,
                hbmUsage: mockHbmUsage,
                trainingProgress: trainingProgress // Track training progress as percentage
            };

            // Store system data log in MongoDB
            const log = new SystemLog(systemData);
            await log.save();

            // Send data to the WebSocket client
            ws.send(JSON.stringify(systemData));

        } catch (error) {
            console.error('Error fetching system data:', error);
        }

    }, 2000); // Send data every 2 seconds

    ws.on('close', () => {
        clearInterval(interval); // Clean up on client disconnect
        console.log('WebSocket client disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
