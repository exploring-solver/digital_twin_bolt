const { publishData } = require('../services/MQTTHandler');

function simulateStructureSensors() {
  const data = {
    timestamp: new Date(),
    structure: {
      boomStrain: (500 + Math.random() * 100).toFixed(2),
      tiltAngle: (0 + Math.random() * 3).toFixed(2),
      load: (1500 + Math.random() * 500).toFixed(2),
      acceleration: (0.2 + Math.random() * 0.5).toFixed(3),
      baseVibration: (0.1 + Math.random() * 0.2).toFixed(3),
      groundPressure: (2.0 + Math.random() * 0.5).toFixed(2)
    }
  };
  publishData('crane/structure', data);
}

module.exports = { simulateStructureSensors };
