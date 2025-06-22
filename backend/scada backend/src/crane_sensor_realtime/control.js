const controlSocket = new net.Socket();
const controlClient = new Modbus.client.TCP(controlSocket, 1);

controlSocket.connect({ host: '192.168.0.17', port: 502 });
controlSocket.on('connect', async () => {
  try {
    const button = await controlClient.readHoldingRegisters(70, 2);
    const mode = await controlClient.readHoldingRegisters(72, 2);
    const latency = await controlClient.readHoldingRegisters(74, 2);
    console.log('Control Data:', {
      button: button.response._body.valuesAsArray[0],
      mode: mode.response._body.valuesAsArray[0],
      latency: latency.response._body.valuesAsArray[0]
    });
  } catch (err) {
    console.error('Control Read Error:', err.message);
  }
});