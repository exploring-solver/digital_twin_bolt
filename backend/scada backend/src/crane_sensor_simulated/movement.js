const { publishData } = require('../services/MQTTHandler');

function simulateMovementSensors() {
  const data = {
    timestamp: new Date(),
    movement: {
      slewAngle: (Math.random() * 360).toFixed(2),
      trolleyPosition: (Math.random() * 30).toFixed(2),
      hoistHeight: (Math.random() * 40).toFixed(2),
      hoistSpeed: (Math.random() * 2).toFixed(2),
      brakeWear: (Math.random()).toFixed(2)
    }
  };
  publishData('crane/movement', data);
}

module.exports = { simulateMovementSensors };
