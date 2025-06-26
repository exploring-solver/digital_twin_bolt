const { publishData } = require('../services/MQTTHandler');

function simulateMiscSensors() {
  const data = {
    timestamp: new Date(),
    misc: {
      iceDetected: Math.random() > 0.98,
      deicingLoad: (0 + Math.random() * 100).toFixed(2),
      doorSealPressure: (5 + Math.random()).toFixed(2),
      cargoLoad: (500 + Math.random() * 100).toFixed(2),
      cargoShift: Math.random() > 0.98
    }
  };

  publishData('airplane/misc', data);
}

module.exports = { simulateMiscSensors };
