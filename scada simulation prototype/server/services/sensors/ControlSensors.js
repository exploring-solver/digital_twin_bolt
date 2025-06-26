export class ControlSensors {
  static simulate() {
    return {
      buttonState: ['IDLE', 'UP', 'DOWN', 'STOP'][Math.floor(Math.random() * 4)],
      selectorSwitch: ['MANUAL', 'AUTO'][Math.floor(Math.random() * 2)],
      signalStrength: parseFloat((70 + Math.random() * 20).toFixed(2)),
      latency: parseFloat((20 + Math.random() * 5).toFixed(2)),
      operatorPresent: Math.random() > 0.05,
      emergencyStop: Math.random() > 0.99,
      controllerStatus: 'online'
    };
  }
}