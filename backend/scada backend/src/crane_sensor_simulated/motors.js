const { publishData } = require('../services/MQTTHandler');

function simulateMotorSensors() {
  const data = {
    timestamp: new Date(),
    motors: {
      motorCurrent: (60 + Math.random() * 10).toFixed(2),
      motorTemp: (60 + Math.random() * 10).toFixed(2),
      rpm: (1450 + Math.random() * 100).toFixed(2),
      brakeTemp: (80 + Math.random() * 20).toFixed(2)
    }
  };
  publishData('crane/motors', data);
}

module.exports = { simulateMotorSensors };
