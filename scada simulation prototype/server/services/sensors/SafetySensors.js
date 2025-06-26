export class SafetySensors {
  static simulate() {
    return {
      overload: Math.random() > 0.97,
      torque: parseFloat((2500 + Math.random() * 300).toFixed(2)),
      eStop: Math.random() > 0.99,
      operatorPresent: Math.random() > 0.05,
      fallArrest: Math.random() > 0.995,
      limitSwitches: {
        upper: Math.random() > 0.02,
        lower: Math.random() > 0.02,
        left: Math.random() > 0.02,
        right: Math.random() > 0.02
      },
      overloadProtection: Math.random() > 0.05,
      emergencyBrake: Math.random() > 0.98,
      antiCollision: Math.random() > 0.03
    };
  }
}