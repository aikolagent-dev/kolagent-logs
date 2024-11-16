const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Enable trust proxy for Heroku
app.enable('trust proxy');

// Serve static files from 'public' directory
app.use(express.static('public'));

// Store logs in memory
const logs = [];
const MAX_LOGS = 100;

// Endpoint to get historical logs
app.get('/logs', (req, res) => {
    res.json(logs);
});

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
});

// Function to broadcast logs
function broadcastLog(logEntry) {
    logs.push(logEntry);
    if (logs.length > MAX_LOGS) logs.shift();
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(logEntry));
        }
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));