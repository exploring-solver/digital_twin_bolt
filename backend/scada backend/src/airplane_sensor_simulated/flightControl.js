const { publishData } = require('../services/MQTTHandler');

function simulateFlightControlSensors() {
  const data = {
    timestamp: new Date(),
    flightControl: {
      aileronPos: (0 + Math.random() * 30).toFixed(2), // degrees
      elevatorPos: (0 + Math.random() * 25).toFixed(2),
      rudderPos: (0 + Math.random() * 20).toFixed(2),
      hydraulicPressure: (2500 + Math.random() * 100).toFixed(2),
      IMU: {
        yaw: (0 + Math.random() * 360).toFixed(2),
        pitch: (-10 + Math.random() * 20).toFixed(2),
        roll: (-15 + Math.random() * 30).toFixed(2),
      },
      AOA: (0 + Math.random() * 20).toFixed(2) // Angle of Attack
    }
  };

  publishData('airplane/flightControl', data);
}

module.exports = { simulateFlightControlSensors };
