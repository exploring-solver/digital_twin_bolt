export class MotorSensors {
  static simulate() {
    const now = Date.now();
    const baseVariation = Math.sin(now / 10000) * 0.1;
    
    return {
      motorCurrent: parseFloat((60 + Math.random() * 10).toFixed(2)),
      motorTemp: parseFloat((60 + Math.random() * 10).toFixed(2)),
      rpm: parseFloat((1450 + Math.random() * 100).toFixed(2)),
      brakeTemp: parseFloat((80 + Math.random() * 20).toFixed(2)),
      hoistMotorTemp: 65 + baseVariation * 20 + (Math.random() - 0.5) * 5,
      trolleyMotorTemp: 60 + baseVariation * 15 + (Math.random() - 0.5) * 4,
      bridgeMotorTemp: 58 + baseVariation * 18 + (Math.random() - 0.5) * 6,
      motorVibration: Math.max(0, 1.2 + baseVariation * 3 + (Math.random() - 0.5) * 0.5)
    };
  }
}