const { publishData } = require('../services/MQTTHandler');

function simulateHydraulicsSensors() {
  const data = {
    timestamp: new Date(),
    hydraulics: {
      fluidPressure: (2800 + Math.random() * 100).toFixed(2),
      flowRate: (15 + Math.random()).toFixed(2),
      contamination: (0 + Math.random() * 0.05).toFixed(4)
    },
    pneumatics: {
      airPressure: (90 + Math.random() * 5).toFixed(2),
      valveOpen: Math.random() > 0.5
    }
  };

  publishData('airplane/hydraulics', data);
}

module.exports = { simulateHydraulicsSensors };
