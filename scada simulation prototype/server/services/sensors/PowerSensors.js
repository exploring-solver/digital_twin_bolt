export class PowerSensors {
  static simulate() {
    const now = Date.now();
    const baseVariation = Math.sin(now / 10000) * 0.1;
    
    return {
      voltage: parseFloat((400 + Math.random() * 10).toFixed(2)),
      current: parseFloat((80 + Math.random() * 10).toFixed(2)),
      batteryLevel: parseFloat((50 + Math.random() * 50).toFixed(2)),
      upsTemp: parseFloat((25 + Math.random() * 10).toFixed(2)),
      powerFactor: 0.85 + baseVariation * 0.1 + (Math.random() - 0.5) * 0.05,
      frequency: 60 + baseVariation * 0.5 + (Math.random() - 0.5) * 0.2
    };
  }
}