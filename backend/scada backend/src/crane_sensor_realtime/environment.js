const environmentSocket = new net.Socket();
const environmentClient = new Modbus.client.TCP(environmentSocket, 1);

environmentSocket.connect({ host: '192.168.0.13', port: 502 });
environmentSocket.on('connect', async () => {
  try {
    const windSpeed = await environmentClient.readHoldingRegisters(30, 2);
    const temperature = await environmentClient.readHoldingRegisters(32, 2);
    const humidity = await environmentClient.readHoldingRegisters(34, 2);
    console.log('Environment Data:', {
      windSpeed: windSpeed.response._body.valuesAsArray[0],
      temperature: temperature.response._body.valuesAsArray[0],
      humidity: humidity.response._body.valuesAsArray[0]
    });
  } catch (err) {
    console.error('Environment Read Error:', err.message);
  }
});
