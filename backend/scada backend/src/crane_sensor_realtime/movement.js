const movementSocket = new net.Socket();
const movementClient = new Modbus.client.TCP(movementSocket, 1);

movementSocket.connect({ host: '192.168.0.12', port: 502 });
movementSocket.on('connect', async () => {
  try {
    const slewAngle = await movementClient.readHoldingRegisters(20, 2);
    const trolleyPos = await movementClient.readHoldingRegisters(22, 2);
    const hoistHeight = await movementClient.readHoldingRegisters(24, 2);
    console.log('Movement Data:', {
      slewAngle: slewAngle.response._body.valuesAsArray[0],
      trolleyPosition: trolleyPos.response._body.valuesAsArray[0],
      hoistHeight: hoistHeight.response._body.valuesAsArray[0]
    });
  } catch (err) {
    console.error('Movement Read Error:', err.message);
  }
});
