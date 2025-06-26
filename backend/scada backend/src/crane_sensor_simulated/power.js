const { publishData } = require('../services/MQTTHandler');

function simulatePowerSensors() {
  const data = {
    timestamp: new Date(),
    power: {
      voltage: (400 + Math.random() * 10).toFixed(2),
      current: (80 + Math.random() * 10).toFixed(2),
      batteryLevel: (50 + Math.random() * 50).toFixed(2),
      upsTemp: (25 + Math.random() * 10).toFixed(2)
    }
  };
  publishData('crane/power', data);
}

module.exports = { simulatePowerSensors };
