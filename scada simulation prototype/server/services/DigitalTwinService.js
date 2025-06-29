import { EnhancedDatabaseService } from './EnhancedDatabaseService.js';
import { SensorFactory } from './sensors/SensorFactory.js';

export class DigitalTwinService {
  constructor() {
    this.databaseService = new EnhancedDatabaseService();
    this.activeTwins = new Map();
  }

  async createTwin(tenantId, twinConfig) {
    this.databaseService.setTenantContext(tenantId);
    
    // Create the digital twin
    const twin = await this.databaseService.createDigitalTwin({
      name: twinConfig.name,
      type: twinConfig.type,
      description: twinConfig.description,
      config: twinConfig.config,
      model_url: twinConfig.modelUrl
    });

    // Create default sensors based on type
    await this.createDefaultSensors(twin.id, twinConfig.type);
    
    return twin;
  }

  async createDefaultSensors(twinId, twinType) {
    const sensorTemplates = this.getSensorTemplates(twinType);
    
    for (const template of sensorTemplates) {
      await this.databaseService.supabase
        .from('sensors')
        .insert({
          digital_twin_id: twinId,
          name: template.name,
          type: template.type,
          position: template.position,
          config: template.config,
          thresholds: template.thresholds,
          unit: template.unit
        });
    }
  }

  getSensorTemplates(twinType) {
    const templates = {
      crane: [
        { name: 'Winch Load', type: 'load', position: { x: 0, y: 10, z: 0 }, 
          config: {}, thresholds: { max: 10000 }, unit: 'kg' },
        { name: 'Motor Temperature', type: 'temperature', position: { x: 0, y: 2, z: 0 }, 
          config: {}, thresholds: { max: 85 }, unit: '°C' },
        { name: 'Wind Speed', type: 'wind', position: { x: 0, y: 15, z: 0 }, 
          config: {}, thresholds: { max: 25 }, unit: 'm/s' }
      ],
      building: [
        { name: 'HVAC Temperature', type: 'temperature', position: { x: 0, y: 3, z: 0 }, 
          config: {}, thresholds: { min: 18, max: 26 }, unit: '°C' },
        { name: 'Occupancy', type: 'occupancy', position: { x: 0, y: 0, z: 0 }, 
          config: {}, thresholds: { max: 100 }, unit: 'people' },
        { name: 'Energy Consumption', type: 'power', position: { x: 0, y: -1, z: 0 }, 
          config: {}, thresholds: { max: 1000 }, unit: 'kW' }
      ],
      factory: [
        { name: 'Production Rate', type: 'rate', position: { x: 0, y: 0, z: 0 }, 
          config: {}, thresholds: { min: 80 }, unit: 'units/hour' },
        { name: 'Machine Vibration', type: 'vibration', position: { x: 0, y: 1, z: 0 }, 
          config: {}, thresholds: { max: 5.0 }, unit: 'mm/s' },
        { name: 'Air Quality', type: 'air_quality', position: { x: 0, y: 3, z: 0 }, 
          config: {}, thresholds: { max: 50 }, unit: 'ppm' }
      ]
    };
    
    return templates[twinType] || [];
  }

  async getTwins(tenantId) {
    this.databaseService.setTenantContext(tenantId);
    return await this.databaseService.getDigitalTwins();
  }

  async updateTwinConfiguration(twinId, config) {
    const { error } = await this.databaseService.supabase
      .from('digital_twins')
      .update({ config, updated_at: new Date().toISOString() })
      .eq('id', twinId);
    
    if (error) throw error;
  }
}