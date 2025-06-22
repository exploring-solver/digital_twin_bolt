const liftingSocket = new net.Socket();
const liftingClient = new Modbus.client.TCP(liftingSocket, 1);

liftingSocket.connect({ host: '192.168.0.11', port: 502 });
liftingSocket.on('connect', async () => {
  try {
    const winchLoad = await liftingClient.readHoldingRegisters(10, 2);
    const tension = await liftingClient.readHoldingRegisters(12, 2);
    const ropeLength = await liftingClient.readHoldingRegisters(14, 2);
    const hookPos = await liftingClient.readHoldingRegisters(16, 2);
    const wear = await liftingClient.readHoldingRegisters(18, 2);
    console.log('Lifting Data:', {
      winchLoad: winchLoad.response._body.valuesAsArray[0],
      tension: tension.response._body.valuesAsArray[0],
      ropeLength: ropeLength.response._body.valuesAsArray[0],
      hookPosition: hookPos.response._body.valuesAsArray[0],
      wear: wear.response._body.valuesAsArray[0]
    });
  } catch (err) {
    console.error('Lifting Read Error:', err.message);
  }
});