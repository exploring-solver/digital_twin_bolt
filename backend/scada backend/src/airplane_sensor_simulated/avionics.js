const { publishData } = require('../services/MQTTHandler');

function simulateAvionicsSensors() {
  const data = {
    timestamp: new Date(),
    avionics: {
      gpsLat: (37.77 + Math.random() * 0.01).toFixed(6),
      gpsLon: (-122.41 + Math.random() * 0.01).toFixed(6),
      baroAlt: (30000 + Math.random() * 1000).toFixed(2),
      radarAlt: (1000 + Math.random() * 200).toFixed(2),
      airspeed: (400 + Math.random() * 20).toFixed(2),
      heading: (0 + Math.random() * 360).toFixed(2),
      signalStrength: (80 + Math.random() * 10).toFixed(2)
    }
  };

  publishData('airplane/avionics', data);
}

module.exports = { simulateAvionicsSensors };
