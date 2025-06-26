const { publishData } = require('../services/MQTTHandler');

function simulateSafetySensors() {
  const data = {
    timestamp: new Date(),
    safety: {
      overload: Math.random() > 0.97,
      torque: (2500 + Math.random() * 300).toFixed(2),
      eStop: Math.random() > 0.99,
      operatorPresent: Math.random() > 0.05,
      fallArrest: Math.random() > 0.995
    }
  };
  publishData('crane/safety', data);
}

module.exports = { simulateSafetySensors };
