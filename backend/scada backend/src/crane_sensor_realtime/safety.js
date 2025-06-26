const safetySocket = new net.Socket();
const safetyClient = new Modbus.client.TCP(safetySocket, 1);

safetySocket.connect({ host: '192.168.0.14', port: 502 });
safetySocket.on('connect', async () => {
  try {
    const overload = await safetyClient.readHoldingRegisters(40, 2);
    const torque = await safetyClient.readHoldingRegisters(42, 2);
    const eStop = await safetyClient.readHoldingRegisters(44, 2);
    console.log('Safety Data:', {
      overload: overload.response._body.valuesAsArray[0],
      torque: torque.response._body.valuesAsArray[0],
      eStop: eStop.response._body.valuesAsArray[0]
    });
  } catch (err) {
    console.error('Safety Read Error:', err.message);
  }
});