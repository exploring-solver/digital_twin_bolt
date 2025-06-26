const { publishData } = require('../services/MQTTHandler');

function simulateLiftingSensors() {
  const data = {
    timestamp: new Date(),
    lifting: {
      winchLoad: (1800 + Math.random() * 300).toFixed(2),
      tension: (200 + Math.random() * 50).toFixed(2),
      ropeLength: (50 + Math.random() * 20).toFixed(2),
      ropeWear: (Math.random()).toFixed(2),
      hookPosition: (10 + Math.random() * 5).toFixed(2),
      hookProximity: Math.random() > 0.1
    }
  };
  publishData('crane/lifting', data);
}

module.exports = { simulateLiftingSensors };
