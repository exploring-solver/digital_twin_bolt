const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 }, () => {
  console.log('WebSocket server running on ws://localhost:8080');
});

module.exports = wss;
