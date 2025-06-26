import { LoggingService } from './LoggingService.js';

export class SensorDataProcessor {
  constructor() {
    this.logger = new LoggingService();
    this.alertThresholds = this.initializeThresholds();
    this.lastProcessedData = null;
  }

  initializeThresholds() {
    return {
      environmental: {
        temperature: { min: -10, max: 50 },
        humidity: { min: 20, max: 80 },
        windSpeed: { max: 25 },
        vibration: { max: 5.0 }
      },
      lifting: {
        loadWeight: { max: 10000 },
        loadSwing: { max: 10 }
      },
      motor: {
        temperature: { max: 85 },
        vibration: { max: 8.0 }
      },
      power: {
        voltage: { min: 440, max: 520 },
        current: { max: 200 },
        powerFactor: { min: 0.7 },
        frequency: { min: 58, max: 62 }
      },
      structural: {
        stress: { max: 800 },
        fatigue: { max: 0.8 },
        structuralHealth: { min: 80 }
      }
    };
  }

  async processSensorData(rawData) {
    try {
      // Validate data integrity
      const validatedData = this.validateSensorData(rawData);
      
      // Apply filtering and smoothing
      const filteredData = this.applySensorFiltering(validatedData);
      
      // Calculate derived metrics
      const processedData = this.calculateDerivedMetrics(filteredData);
      
      // Store for trend analysis
      this.lastProcessedData = processedData;
      
      return processedData;
    } catch (error) {
      this.logger.error('Error processing sensor data', error);
      throw error;
    }
  }

  validateSensorData(data) {
    const validated = { ...data };
    
    // Validate environmental data
    if (validated.environmental) {
      validated.environmental.temperature = this.clampValue(
        validated.environmental.temperature, -50, 100
      );
      validated.environmental.humidity = this.clampValue(
        validated.environmental.humidity, 0, 100
      );
      validated.environmental.windSpeed = Math.max(0, validated.environmental.windSpeed);
      validated.environmental.vibration = Math.max(0, validated.environmental.vibration);
    }
    
    // Validate lifting data
    if (validated.lifting) {
      validated.lifting.loadWeight = Math.max(0, validated.lifting.loadWeight);
      validated.lifting.hookHeight = Math.max(0, validated.lifting.hookHeight);
      validated.lifting.wireLength = Math.max(0, validated.lifting.wireLength);
      validated.lifting.loadSwing = Math.max(0, validated.lifting.loadSwing);
    }
    
    // Validate motor data
    if (validated.motor) {
      validated.motor.hoistMotorTemp = Math.max(0, validated.motor.hoistMotorTemp);
      validated.motor.trolleyMotorTemp = Math.max(0, validated.motor.trolleyMotorTemp);
      validated.motor.bridgeMotorTemp = Math.max(0, validated.motor.bridgeMotorTemp);
      validated.motor.motorVibration = Math.max(0, validated.motor.motorVibration);
    }
    
    return validated;
  }

  applySensorFiltering(data) {
    // Simple moving average filter for noisy sensors
    if (this.lastProcessedData) {
      const alpha = 0.7; // Smoothing factor
      
      return {
        ...data,
        environmental: {
          ...data.environmental,
          temperature: this.exponentialSmoothing(
            data.environmental.temperature,
            this.lastProcessedData.environmental?.temperature,
            alpha
          ),
          vibration: this.exponentialSmoothing(
            data.environmental.vibration,
            this.lastProcessedData.environmental?.vibration,
            alpha
          )
        },
        motor: {
          ...data.motor,
          motorVibration: this.exponentialSmoothing(
            data.motor.motorVibration,
            this.lastProcessedData.motor?.motorVibration,
            alpha
          )
        }
      };
    }
    
    return data;
  }

  calculateDerivedMetrics(data) {
    const derived = { ...data };
    
    // Calculate total power consumption
    if (data.power) {
      derived.power.totalPower = Math.round(
        data.power.voltage * data.power.current * data.power.powerFactor * Math.sqrt(3) / 1000
      );
    }
    
    // Calculate load utilization percentage
    if (data.lifting) {
      derived.lifting.loadUtilization = Math.round(
        (data.lifting.loadWeight / 10000) * 100
      );
    }
    
    // Calculate overall system health score
    derived.systemHealth = this.calculateSystemHealth(data);
    
    return derived;
  }

  calculateSystemHealth(data) {
    let healthScore = 100;
    let factors = 0;
    
    // Environmental factors
    if (data.environmental) {
      if (data.environmental.temperature > 40) healthScore -= 5;
      if (data.environmental.vibration > 3) healthScore -= 10;
      factors++;
    }
    
    // Motor health
    if (data.motor) {
      const avgTemp = (data.motor.hoistMotorTemp + data.motor.trolleyMotorTemp + data.motor.bridgeMotorTemp) / 3;
      if (avgTemp > 75) healthScore -= 8;
      if (data.motor.motorVibration > 5) healthScore -= 12;
      factors++;
    }
    
    // Structural health
    if (data.structural) {
      healthScore = Math.min(healthScore, data.structural.structuralHealth);
      if (data.structural.stress > 600) healthScore -= 15;
      if (data.structural.crackDetection) healthScore -= 25;
      factors++;
    }
    
    // Safety factors
    if (data.safety) {
      if (!data.safety.overloadProtection) healthScore -= 20;
      if (data.safety.emergencyBrake) healthScore -= 30;
      factors++;
    }
    
    return Math.max(0, Math.round(healthScore));
  }

  checkAlerts(data) {
    const alerts = [];
    const now = new Date().toISOString();
    
    // Environmental alerts
    if (data.environmental) {
      const env = data.environmental;
      if (env.temperature > this.alertThresholds.environmental.temperature.max) {
        alerts.push({
          type: 'warning',
          category: 'environmental',
          message: `High temperature detected: ${env.temperature.toFixed(1)}°C`,
          timestamp: now,
          value: env.temperature,
          threshold: this.alertThresholds.environmental.temperature.max
        });
      }
      
      if (env.windSpeed > this.alertThresholds.environmental.windSpeed.max) {
        alerts.push({
          type: 'danger',
          category: 'environmental',
          message: `Dangerous wind speed: ${env.windSpeed.toFixed(1)} m/s`,
          timestamp: now,
          value: env.windSpeed,
          threshold: this.alertThresholds.environmental.windSpeed.max
        });
      }
    }
    
    // Motor alerts
    if (data.motor) {
      const motor = data.motor;
      const temps = [motor.hoistMotorTemp, motor.trolleyMotorTemp, motor.bridgeMotorTemp];
      const maxTemp = Math.max(...temps);
      
      if (maxTemp > this.alertThresholds.motor.temperature.max) {
        alerts.push({
          type: 'danger',
          category: 'motor',
          message: `Motor overheating: ${maxTemp.toFixed(1)}°C`,
          timestamp: now,
          value: maxTemp,
          threshold: this.alertThresholds.motor.temperature.max
        });
      }
    }
    
    // Safety alerts
    if (data.safety) {
      if (data.safety.emergencyBrake) {
        alerts.push({
          type: 'critical',
          category: 'safety',
          message: 'Emergency brake activated',
          timestamp: now
        });
      }
      
      if (!data.safety.overloadProtection) {
        alerts.push({
          type: 'danger',
          category: 'safety',
          message: 'Overload protection disabled',
          timestamp: now
        });
      }
    }
    
    // Structural alerts
    if (data.structural) {
      if (data.structural.crackDetection) {
        alerts.push({
          type: 'critical',
          category: 'structural',
          message: 'Structural crack detected',
          timestamp: now
        });
      }
      
      if (data.structural.stress > this.alertThresholds.structural.stress.max) {
        alerts.push({
          type: 'warning',
          category: 'structural',
          message: `High structural stress: ${data.structural.stress.toFixed(0)} MPa`,
          timestamp: now,
          value: data.structural.stress,
          threshold: this.alertThresholds.structural.stress.max
        });
      }
    }
    
    return alerts;
  }

  async getCurrentSensorData() {
    return this.lastProcessedData;
  }

  clampValue(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  exponentialSmoothing(current, previous, alpha) {
    if (previous === undefined || previous === null) {
      return current;
    }
    return alpha * current + (1 - alpha) * previous;
  }
}