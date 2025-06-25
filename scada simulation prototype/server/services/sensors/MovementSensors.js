export class MovementSensors {
  static simulate() {
    const now = Date.now();
    const baseVariation = Math.sin(now / 10000) * 0.1;
    
    return {
      slewAngle: parseFloat((Math.random() * 360).toFixed(2)),
      trolleyPosition: parseFloat((Math.random() * 30).toFixed(2)),
      hoistHeight: parseFloat((Math.random() * 40).toFixed(2)),
      hoistSpeed: parseFloat((Math.random() * 2).toFixed(2)),
      brakeWear: parseFloat((Math.random()).toFixed(2)),
      bridgePosition: 50 + baseVariation * 30,
      hookPosition: { x: 12.5, y: 15.2, z: 8.3 },
      speed: Math.abs(baseVariation * 5 + (Math.random() - 0.5) * 2)
    };
  }
}