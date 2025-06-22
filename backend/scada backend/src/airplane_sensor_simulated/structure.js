const { publishData } = require('../services/MQTTHandler');

function simulateStructureSensors() {
  const data = {
    timestamp: new Date(),
    structure: {
      wingLoad: (10000 + Math.random() * 2000).toFixed(2),
      flexAngle: (0 + Math.random() * 5).toFixed(2),
      vibration: (0.1 + Math.random() * 0.3).toFixed(3),
      strain: (0.0005 + Math.random() * 0.0002).toFixed(5),
      crackDetected: Math.random() > 0.995
    }
  };

  publishData('airplane/structure', data);
}

module.exports = { simulateStructureSensors };
