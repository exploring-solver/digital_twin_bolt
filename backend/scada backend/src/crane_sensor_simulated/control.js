const { publishData } = require('../services/MQTTHandler');

function simulateControlSensors() {
  const data = {
    timestamp: new Date(),
    control: {
      buttonState: ['IDLE', 'UP', 'DOWN', 'STOP'][Math.floor(Math.random() * 4)],
      selectorSwitch: ['MANUAL', 'AUTO'][Math.floor(Math.random() * 2)],
      signalStrength: (70 + Math.random() * 20).toFixed(2),
      latency: (20 + Math.random() * 5).toFixed(2)
    }
  };
  publishData('crane/control', data);
}

module.exports = { simulateControlSensors };
