import { EnhancedDatabaseService } from "./EnhancedDatabaseService.js";
import { LoggingService } from "./LoggingService.js";
import { v4 as uuidv4 } from 'uuid';
// services/SensorRegistrationService.js
export class SensorRegistrationService {
  constructor() {
    this.databaseService = new EnhancedDatabaseService();
    this.logger = new LoggingService();
  }

  async createProject({ name, description, userId, tenantId }) {
    const projectToken = this.generateProjectToken();
    
    const project = {
      id: uuidv4(),
      name,
      description,
      userId,
      tenantId,
      projectToken,
      createdAt: new Date().toISOString()
    };
    
    await this.databaseService.supabase
      .from('projects')
      .insert(project);
    
    return project;
  }

  async validateProjectToken(token) {
    const { data, error } = await this.databaseService.supabase
      .from('projects')
      .select('*')
      .eq('projectToken', token)
      .single();
    
    if (error) return null;
    return data;
  }

  async registerSensor({ projectId, sensorType, sensorId, metadata }) {
    const sensor = {
      id: uuidv4(),
      projectId,
      sensorType,
      sensorId,
      metadata: metadata || {},
      registeredAt: new Date().toISOString(),
      status: 'active'
    };
    
    await this.databaseService.supabase
      .from('registered_sensors')
      .insert(sensor);
    
    return sensor;
  }

  async addSensorToTwin(twinId, sensorData) {
    const sensor = {
      id: uuidv4(),
      digitalTwinId: twinId,
      ...sensorData,
      createdAt: new Date().toISOString()
    };
    
    await this.databaseService.supabase
      .from('sensors')
      .insert(sensor);
    
    return sensor;
  }

  async updateSensorPosition(sensorId, position) {
    await this.databaseService.supabase
      .from('sensors')
      .update({ position })
      .eq('id', sensorId);
  }

  async getSensorsByTwin(twinId) {
    const { data, error } = await this.databaseService.supabase
      .from('sensors')
      .select('*')
      .eq('digitalTwinId', twinId);
    
    if (error) throw error;
    return data || [];
  }

  async getTwinIdBySensor(sensorId) {
    const { data, error } = await this.databaseService.supabase
      .from('sensors')
      .select('digitalTwinId')
      .eq('sensorId', sensorId)
      .single();
    
    if (error) return null;
    return data?.digitalTwinId;
  }

  async storeCommand(twinId, command) {
    await this.databaseService.supabase
      .from('twin_commands')
      .insert({
        id: uuidv4(),
        twinId,
        command,
        timestamp: new Date().toISOString()
      });
  }

  async checkAlerts(dataPoint) {
    // Implement alert logic based on thresholds
    const alerts = [];
    
    // Example alert logic
    if (dataPoint.reading.temperature > 85) {
      alerts.push({
        id: uuidv4(),
        type: 'warning',
        message: `High temperature detected: ${dataPoint.reading.temperature}°C`,
        sensorId: dataPoint.sensorId,
        timestamp: new Date().toISOString()
      });
    }
    
    return alerts;
  }

  generateProjectToken() {
    return `dt_${uuidv4().replace(/-/g, '')}`;
  }

  async getProjectsByUser(userId) {
    const { data, error } = await this.databaseService.supabase
      .from('projects')
      .select('*')
      .eq('userId', userId);
    
    if (error) throw error;
    return data || [];
  }
}
