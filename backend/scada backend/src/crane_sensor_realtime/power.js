const powerSocket = new net.Socket();
const powerClient = new Modbus.client.TCP(powerSocket, 1);

powerSocket.connect({ host: '192.168.0.16', port: 502 });
powerSocket.on('connect', async () => {
  try {
    const voltage = await powerClient.readHoldingRegisters(60, 2);
    const power = await powerClient.readHoldingRegisters(62, 2);
    const battery = await powerClient.readHoldingRegisters(64, 2);
    console.log('Power Data:', {
      voltage: voltage.response._body.valuesAsArray[0],
      power: power.response._body.valuesAsArray[0],
      battery: battery.response._body.valuesAsArray[0]
    });
  } catch (err) {
    console.error('Power Read Error:', err.message);
  }
});
