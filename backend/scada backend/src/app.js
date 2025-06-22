require('./websocket/server');
const { initializeAllModbusClients } = require('./modbus');

initializeAllModbusClients(); 
