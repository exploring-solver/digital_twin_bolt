export class StructureSensors {
  static simulate() {
    const now = Date.now();
    const baseVariation = Math.sin(now / 10000) * 0.1;
    
    return {
      boomStrain: parseFloat((500 + Math.random() * 100).toFixed(2)),
      tiltAngle: parseFloat((0 + Math.random() * 3).toFixed(2)),
      load: parseFloat((1500 + Math.random() * 500).toFixed(2)),
      acceleration: parseFloat((0.2 + Math.random() * 0.5).toFixed(3)),
      baseVibration: parseFloat((0.1 + Math.random() * 0.2).toFixed(3)),
      groundPressure: parseFloat((2.0 + Math.random() * 0.5).toFixed(2)),
      stress: Math.max(0, 450 + baseVariation * 200 + (Math.random() - 0.5) * 100),
      fatigue: 0.15 + baseVariation * 0.3 + (Math.random() - 0.5) * 0.05,
      crackDetection: Math.random() > 0.999,
      structuralHealth: 95 + baseVariation * 4 + (Math.random() - 0.5) * 2
    };
  }
}