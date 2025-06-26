const { publishData } = require('./services/mqttHandler');

function simulateCraneSensors() {
  const data = {
    timestamp: new Date(),
    structure: {
      boomStrain: (500 + Math.random() * 100).toFixed(2),
      tiltAngle: (0 + Math.random() * 3).toFixed(2),
      load: (1500 + Math.random() * 500).toFixed(2),
      acceleration: (0.2 + Math.random() * 0.5).toFixed(3),
      baseVibration: (0.1 + Math.random() * 0.2).toFixed(3),
      groundPressure: (2.0 + Math.random() * 0.5).toFixed(2)
    },
    lifting: {
      winchLoad: (1800 + Math.random() * 300).toFixed(2),
      tension: (200 + Math.random() * 50).toFixed(2),
      ropeLength: (50 + Math.random() * 20).toFixed(2),
      ropeWear: (Math.random()).toFixed(2),
      hookPosition: (10 + Math.random() * 5).toFixed(2),
      hookProximity: Math.random() > 0.1
    },
    movement: {
      slewAngle: (Math.random() * 360).toFixed(2),
      trolleyPosition: (Math.random() * 30).toFixed(2),
      hoistHeight: (Math.random() * 40).toFixed(2),
      hoistSpeed: (Math.random() * 2).toFixed(2),
      brakeWear: (Math.random()).toFixed(2)
    },
    environment: {
      windSpeed: (Math.random() * 20).toFixed(2),
      windDirection: (Math.random() * 360).toFixed(2),
      temperature: (-5 + Math.random() * 35).toFixed(2),
      humidity: (30 + Math.random() * 40).toFixed(2),
      rainDetected: Math.random() > 0.95,
      collision: Math.random() > 0.98
    },
    safety: {
      overload: Math.random() > 0.97,
      torque: (2500 + Math.random() * 300).toFixed(2),
      eStop: Math.random() > 0.99,
      operatorPresent: Math.random() > 0.05,
      fallArrest: Math.random() > 0.995
    },
    motors: {
      motorCurrent: (60 + Math.random() * 10).toFixed(2),
      motorTemp: (60 + Math.random() * 10).toFixed(2),
      rpm: (1450 + Math.random() * 100).toFixed(2),
      brakeTemp: (80 + Math.random() * 20).toFixed(2)
    },
    power: {
      voltage: (400 + Math.random() * 10).toFixed(2),
      current: (80 + Math.random() * 10).toFixed(2),
      batteryLevel: (50 + Math.random() * 50).toFixed(2),
      upsTemp: (25 + Math.random() * 10).toFixed(2)
    },
    control: {
      buttonState: ['IDLE', 'UP', 'DOWN', 'STOP'][Math.floor(Math.random() * 4)],
      selectorSwitch: ['MANUAL', 'AUTO'][Math.floor(Math.random() * 2)],
      signalStrength: (70 + Math.random() * 20).toFixed(2),
      latency: (20 + Math.random() * 5).toFixed(2)
    }
  };

  publishData('crane/data', data);
}

module.exports = { simulateCraneSensors };
