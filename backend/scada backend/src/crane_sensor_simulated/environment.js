const { publishData } = require('../services/MQTTHandler');

function simulateEnvironmentSensors() {
  const data = {
    timestamp: new Date(),
    environment: {
      windSpeed: (Math.random() * 20).toFixed(2),
      windDirection: (Math.random() * 360).toFixed(2),
      temperature: (-5 + Math.random() * 35).toFixed(2),
      humidity: (30 + Math.random() * 40).toFixed(2),
      rainDetected: Math.random() > 0.95,
      collision: Math.random() > 0.98
    }
  };
  publishData('crane/environment', data);
}

module.exports = { simulateEnvironmentSensors };
