const { publishData } = require('../services/MQTTHandler');

function simulateHUMSSensors() {
  const data = {
    timestamp: new Date(),
    hums: {
      gyroDrift: (0.01 + Math.random() * 0.02).toFixed(4),
      accelVariance: (0.1 + Math.random() * 0.05).toFixed(4),
      magnetoNoise: (0.2 + Math.random() * 0.1).toFixed(4),
      rpmVibrationSignature: (0.2 + Math.random() * 0.3).toFixed(2),
      runtimeHours: (Math.random() * 5000).toFixed(2)
    }
  };

  publishData('airplane/hums', data);
}

module.exports = { simulateHUMSSensors };
