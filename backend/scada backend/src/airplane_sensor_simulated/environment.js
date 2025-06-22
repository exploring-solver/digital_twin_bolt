const { publishData } = require('../services/MQTTHandler');

function simulateEnvironmentSensors() {
  const data = {
    timestamp: new Date(),
    environment: {
      cabinTemp: (20 + Math.random() * 5).toFixed(2),
      cabinPressure: (10 + Math.random() * 2).toFixed(2),
      CO2: (300 + Math.random() * 50).toFixed(2),
      O2: (21 + Math.random() * 1).toFixed(2),
      humidity: (30 + Math.random() * 20).toFixed(2),
      smokeDetected: Math.random() > 0.99
    }
  };

  publishData('airplane/environment', data);
}

module.exports = { simulateEnvironmentSensors };
