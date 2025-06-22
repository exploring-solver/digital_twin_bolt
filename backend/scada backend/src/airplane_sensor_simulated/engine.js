const { publishData } = require('../services/MQTTHandler');

function simulateEngineSensors() {
  const data = {
    timestamp: new Date(),
    engine: {
      EGT: (650 + Math.random() * 50).toFixed(2),              // Exhaust Gas Temp
      ITT: (875 + Math.random() * 25).toFixed(2),              // Inter Turbine Temp
      CHT: (350 + Math.random() * 20).toFixed(2),              // Cylinder Head Temp
      oilPressure: (40 + Math.random() * 10).toFixed(2),       // Oil Pressure
      fuelPressure: (30 + Math.random() * 10).toFixed(2),      // Fuel Pressure
      airPressure: (25 + Math.random() * 5).toFixed(2),        // Compressor Air Pressure
      vibration: (0.2 + Math.random() * 0.3).toFixed(3),       // Vibration mm/s
      rpm_N1: (91 + Math.random() * 3).toFixed(2),             // Fan speed
      rpm_N2: (94 + Math.random() * 4).toFixed(2),             // Core speed
      fuelFlow: (2600 + Math.random() * 200).toFixed(2),       // Fuel Flow
      exhaustGas: (0.6 + Math.random() * 0.1).toFixed(2),      // CO/CO2 Exhaust Gas
      fuelTemp: (15 + Math.random() * 10).toFixed(2)           // Fuel Temperature
    }
  };

  publishData('airplane/engine', data);
}

module.exports = { simulateEngineSensors };
