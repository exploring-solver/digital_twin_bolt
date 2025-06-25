export class EnvironmentSensors {
  static simulate() {
    return {
      windSpeed: parseFloat((Math.random() * 20).toFixed(2)),
      windDirection: parseFloat((Math.random() * 360).toFixed(2)),
      temperature: parseFloat((-5 + Math.random() * 35).toFixed(2)),
      humidity: parseFloat((30 + Math.random() * 40).toFixed(2)),
      rainDetected: Math.random() > 0.95,
      collision: Math.random() > 0.98,
      vibration: parseFloat((0.5 + Math.random() * 0.3).toFixed(3))
    };
  }
}