const Modbus = require('jsmodbus');
const net = require('net');

const structureSocket = new net.Socket();
const structureClient = new Modbus.client.TCP(structureSocket, 1);

structureSocket.connect({ host: '192.168.0.10', port: 502 });
structureSocket.on('connect', async () => {
  try {
    const boomStrain = await structureClient.readHoldingRegisters(0, 2);
    const tiltAngle = await structureClient.readHoldingRegisters(2, 2);
    const load = await structureClient.readHoldingRegisters(4, 2);
    const vibration = await structureClient.readHoldingRegisters(6, 2);
    const pressure = await structureClient.readHoldingRegisters(8, 2);
    console.log('Structure Data:', {
      boomStrain: boomStrain.response._body.valuesAsArray[0],
      tiltAngle: tiltAngle.response._body.valuesAsArray[0],
      load: load.response._body.valuesAsArray[0],
      vibration: vibration.response._body.valuesAsArray[0],
      pressure: pressure.response._body.valuesAsArray[0],
    });
  } catch (err) {
    console.error('Structure Read Error:', err.message);
  }
});