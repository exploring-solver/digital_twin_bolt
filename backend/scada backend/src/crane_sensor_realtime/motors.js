const motorsSocket = new net.Socket();
const motorsClient = new Modbus.client.TCP(motorsSocket, 1);

motorsSocket.connect({ host: '192.168.0.15', port: 502 });
motorsSocket.on('connect', async () => {
  try {
    const motorTemp = await motorsClient.readHoldingRegisters(50, 2);
    const rpm = await motorsClient.readHoldingRegisters(52, 2);
    const current = await motorsClient.readHoldingRegisters(54, 2);
    console.log('Motors Data:', {
      motorTemp: motorTemp.response._body.valuesAsArray[0],
      rpm: rpm.response._body.valuesAsArray[0],
      current: current.response._body.valuesAsArray[0]
    });
  } catch (err) {
    console.error('Motors Read Error:', err.message);
  }
});
