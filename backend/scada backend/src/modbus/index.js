const { startStructureClient } = require('./structure');
const { startMotorsClient } = require('./motors');
const { startLiftingClient } = require('./lifting');

function initializeAllModbusClients() {
  startStructureClient();
  startMotorsClient();
  startLiftingClient();
  // add all the components here (simulated/realtime)
}

module.exports = { initializeAllModbusClients };
