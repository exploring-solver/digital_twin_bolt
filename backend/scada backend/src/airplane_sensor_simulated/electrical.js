const { publishData } = require('../services/MQTTHandler');

function simulateElectricalSensors() {
  const data = {
    timestamp: new Date(),
    electrical: {
      batteryVoltage: (24 + Math.random()).toFixed(2),
      currentDraw: (50 + Math.random() * 10).toFixed(2),
      generatorOutput: (28 + Math.random() * 2).toFixed(2),
      load: (70 + Math.random() * 20).toFixed(2),
      relayStatus: Math.random() > 0.2
    }
  };

  publishData('airplane/electrical', data);
}

module.exports = { simulateElectricalSensors };
