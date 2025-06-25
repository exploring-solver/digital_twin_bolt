import { createClient } from '@supabase/supabase-js';
import { LoggingService } from './LoggingService.js';

export class DatabaseService {
  constructor() {
    this.logger = new LoggingService();
    this.supabaseUrl = process.env.VITE_SUPABASE_URL;
    this.supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (this.supabaseUrl && this.supabaseKey) {
      this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    } else {
      this.logger.warn('Supabase credentials not found, using local storage simulation');
      this.localData = [];
    }
  }

  async initialize() {
    if (this.supabase) {
      try {
        // Test connection
        const { data, error } = await this.supabase
          .from('sensor_data')
          .select('count')
          .limit(1);
        
        if (error && error.code === '42P01') {
          this.logger.info('Creating sensor_data table...');
          // Table will be created via Supabase migrations
        }
        
        this.logger.info('Database service initialized successfully');
      } catch (error) {
        this.logger.error('Database initialization error', error);
      }
    } else {
      this.logger.info('Database service initialized in simulation mode');
    }
  }

  async storeSensorData(sensorData) {
    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from('sensor_data')
          .insert([{
            timestamp: sensorData.timestamp,
            control_data: sensorData.control,
            environmental_data: sensorData.environmental,
            lifting_data: sensorData.lifting,
            motor_data: sensorData.motor,
            movement_data: sensorData.movement,
            power_data: sensorData.power,
            safety_data: sensorData.safety,
            structural_data: sensorData.structural
          }]);

        if (error) {
          this.logger.error('Failed to store sensor data', error);
        }
      } catch (error) {
        this.logger.error('Database storage error', error);
      }
    } else {
      // Local storage simulation
      this.localData.push({
        ...sensorData,
        id: Date.now()
      });
      
      // Keep only last 1000 records
      if (this.localData.length > 1000) {
        this.localData = this.localData.slice(-1000);
      }
    }
  }

  async getSensorHistory(startTime, endTime, sensorType) {
    if (this.supabase) {
      try {
        let query = this.supabase
          .from('sensor_data')
          .select('*')
          .order('timestamp', { ascending: false });

        if (startTime) {
          query = query.gte('timestamp', startTime);
        }
        if (endTime) {
          query = query.lte('timestamp', endTime);
        }

        const { data, error } = await query.limit(1000);

        if (error) {
          this.logger.error('Failed to fetch sensor history', error);
          return [];
        }

        return data || [];
      } catch (error) {
        this.logger.error('Database query error', error);
        return [];
      }
    } else {
      // Local storage simulation
      let filtered = [...this.localData];
      
      if (startTime) {
        filtered = filtered.filter(item => item.timestamp >= startTime);
      }
      if (endTime) {
        filtered = filtered.filter(item => item.timestamp <= endTime);
      }
      
      return filtered.slice(-100); // Return last 100 records
    }
  }

  async getLatestSensorData() {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('sensor_data')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(1);

        if (error) {
          this.logger.error('Failed to fetch latest sensor data', error);
          return null;
        }

        return data && data.length > 0 ? data[0] : null;
      } catch (error) {
        this.logger.error('Database query error', error);
        return null;
      }
    } else {
      return this.localData[this.localData.length - 1] || null;
    }
  }
}