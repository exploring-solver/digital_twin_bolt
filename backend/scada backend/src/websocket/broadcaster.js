const wss = require('./server');

function broadcastToAll(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(json);
    }
  });
}

module.exports = { broadcastToAll };
