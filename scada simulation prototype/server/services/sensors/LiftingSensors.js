export class LiftingSensors {
  static simulate() {
    const now = Date.now();
    const baseVariation = Math.sin(now / 10000) * 0.1;
    
    return {
      winchLoad: parseFloat((1800 + Math.random() * 300).toFixed(2)),
      tension: parseFloat((200 + Math.random() * 50).toFixed(2)),
      ropeLength: parseFloat((50 + Math.random() * 20).toFixed(2)),
      ropeWear: parseFloat((Math.random()).toFixed(2)),
      hookPosition: parseFloat((10 + Math.random() * 5).toFixed(2)),
      hookProximity: Math.random() > 0.1,
      loadWeight: Math.max(0, 1000 + baseVariation * 2000 + (Math.random() - 0.5) * 500),
      hookHeight: 15 + baseVariation * 10 + (Math.random() - 0.5) * 2,
      wireLength: 25 + baseVariation * 15 + (Math.random() - 0.5) * 3,
      loadSwing: Math.abs(baseVariation * 5 + (Math.random() - 0.5) * 2)
    };
  }
}