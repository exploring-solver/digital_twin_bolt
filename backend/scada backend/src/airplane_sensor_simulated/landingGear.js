const { publishData } = require('../services/MQTTHandler');

function simulateLandingGearSensors() {
  const data = {
    timestamp: new Date(),
    landingGear: {
      position: ['UP', 'DOWN'][Math.floor(Math.random() * 2)],
      proximity: Math.random() > 0.1,
      tirePressure: (200 + Math.random() * 10).toFixed(2),
      shockAbsorption: (1 + Math.random()).toFixed(2)
    },
    brakeSystem: {
      temp: (100 + Math.random() * 50).toFixed(2),
      pressure: (3000 + Math.random() * 200).toFixed(2),
      wear: (0 + Math.random() * 1).toFixed(2)
    }
  };

  publishData('airplane/landingGear', data);
}

module.exports = { simulateLandingGearSensors };
