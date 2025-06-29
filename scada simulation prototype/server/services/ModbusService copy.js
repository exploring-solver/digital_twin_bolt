import ModbusRTU from 'modbus-serial';
import { LoggingService } from './LoggingService.js';
import { ControlSensors } from './sensors/ControlSensors.js';
import { EnvironmentSensors } from './sensors/EnvironmentSensors.js';
import { LiftingSensors } from './sensors/LiftingSensors.js';
import { MotorSensors } from './sensors/MotorSensors.js';
import { MovementSensors } from './sensors/MovementSensors.js';
import { PowerSensors } from './sensors/PowerSensors.js';
import { SafetySensors } from './sensors/SafetySensors.js';
import { StructureSensors } from './sensors/StructureSensors.js';

export class ModbusService {
  constructor() {
    this.client = new ModbusRTU();
    this.logger = new LoggingService();
    this.isConnected = false;
    this.simulationMode = true; // Switch to false for real Modbus
  }

  async initialize() {
    try {
      if (this.simulationMode) {
        this.logger.info('Initializing Modbus service in simulation mode');
        this.isConnected = true;
      } else {
        // For real Modbus connection
        await this.client.connectTCP('192.168.1.100', { port: 502 });
        this.client.setID(1);
        this.isConnected = true;
        this.logger.info('Connected to Modbus device');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Modbus connection', error);
      throw error;
    }
  }

  async readSensorData() {
    if (!this.isConnected) {
      throw new Error('Modbus not connected');
    }

    if (this.simulationMode) {
      return this.generateSimulatedData();
    }

    try {
      // Read real Modbus data from different address ranges
      const controlData = await this.client.readHoldingRegisters(0, 10);
      const environmentalData = await this.client.readHoldingRegisters(20, 10);
      const liftingData = await this.client.readHoldingRegisters(40, 10);
      const motorData = await this.client.readHoldingRegisters(60, 10);
      const movementData = await this.client.readHoldingRegisters(80, 10);
      const powerData = await this.client.readHoldingRegisters(100, 10);
      const safetyData = await this.client.readHoldingRegisters(120, 10);
      const structuralData = await this.client.readHoldingRegisters(140, 10);

      return {
        control: this.parseControlData(controlData.data),
        environmental: this.parseEnvironmentalData(environmentalData.data),
        lifting: this.parseLiftingData(liftingData.data),
        motor: this.parseMotorData(motorData.data),
        movement: this.parseMovementData(movementData.data),
        power: this.parsePowerData(powerData.data),
        safety: this.parseSafetyData(safetyData.data),
        structural: this.parseStructuralData(structuralData.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Failed to read Modbus data', error);
      throw error;
    }
  }

  generateSimulatedData() {
    return {
      control: ControlSensors.simulate(),
      environmental: EnvironmentSensors.simulate(),
      lifting: LiftingSensors.simulate(),
      motor: MotorSensors.simulate(),
      movement: MovementSensors.simulate(),
      power: PowerSensors.simulate(),
      safety: SafetySensors.simulate(),
      structural: StructureSensors.simulate(),
      timestamp: new Date().toISOString()
    };
  }

  parseControlData(data) {
    return {
      buttonState: ['IDLE', 'UP', 'DOWN', 'STOP'][data[0] || 0],
      selectorSwitch: ['MANUAL', 'AUTO'][data[1] || 0],
      signalStrength: data[2] / 10,
      latency: data[3] / 10,
      operatorPresent: Boolean(data[4]),
      emergencyStop: Boolean(data[5]),
      controllerStatus: data[6] > 0 ? 'online' : 'offline'
    };
  }

  parseEnvironmentalData(data) {
    return {
      windSpeed: data[0] / 100,
      windDirection: data[1] / 10,
      temperature: (data[2] - 500) / 10,
      humidity: data[3] / 100,
      rainDetected: Boolean(data[4]),
      collision: Boolean(data[5]),
      vibration: data[6] / 1000
    };
  }

  parseLiftingData(data) {
    return {
      winchLoad: data[0],
      tension: data[1] / 10,
      ropeLength: data[2] / 100,
      ropeWear: data[3] / 1000,
      hookPosition: data[4] / 100,
      hookProximity: Boolean(data[5]),
      loadWeight: data[6],
      hookHeight: data[7] / 100,
      wireLength: data[8] / 100,
      loadSwing: data[9] / 100
    };
  }

  parseMotorData(data) {
    return {
      motorCurrent: data[0] / 10,
      motorTemp: data[1] / 10,
      rpm: data[2],
      brakeTemp: data[3] / 10,
      hoistMotorTemp: data[4] / 10,
      trolleyMotorTemp: data[5] / 10,
      bridgeMotorTemp: data[6] / 10,
      motorVibration: data[7] / 1000
    };
  }

  parseMovementData(data) {
    return {
      slewAngle: data[0] / 10,
      trolleyPosition: data[1] / 100,
      hoistHeight: data[2] / 100,
      hoistSpeed: data[3] / 100,
      brakeWear: data[4] / 1000,
      bridgePosition: data[5] / 100,
      hookPosition: {
        x: data[6] / 100,
        y: data[7] / 100,
        z: data[8] / 100
      },
      speed: data[9] / 100
    };
  }

  parsePowerData(data) {
    return {
      voltage: data[0] / 10,
      current: data[1] / 10,
      batteryLevel: data[2] / 10,
      upsTemp: data[3] / 10,
      powerFactor: data[4] / 1000,
      frequency: data[5] / 100
    };
  }

  parseSafetyData(data) {
    return {
      overload: Boolean(data[0]),
      torque: data[1],
      eStop: Boolean(data[2]),
      operatorPresent: Boolean(data[3]),
      fallArrest: Boolean(data[4]),
      limitSwitches: {
        upper: Boolean(data[5] & 1),
        lower: Boolean(data[5] & 2),
        left: Boolean(data[5] & 4),
        right: Boolean(data[5] & 8)
      },
      overloadProtection: Boolean(data[6]),
      emergencyBrake: Boolean(data[7]),
      antiCollision: Boolean(data[8])
    };
  }

  parseStructuralData(data) {
    return {
      boomStrain: data[0],
      tiltAngle: data[1] / 100,
      load: data[2],
      acceleration: data[3] / 1000,
      baseVibration: data[4] / 1000,
      groundPressure: data[5] / 100,
      stress: data[6],
      fatigue: data[7] / 1000,
      crackDetection: Boolean(data[8]),
      structuralHealth: data[9] / 10
    };
  }
}