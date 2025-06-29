import { createClient } from '@supabase/supabase-js';
import { LoggingService } from './LoggingService.js';

export class EnhancedDatabaseService {
  constructor() {
    this.logger = new LoggingService();
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    this.tenantContext = null;
  }

  setTenantContext(tenantId) {
    this.tenantContext = tenantId;
  }

  async initialize() {
    try {
      // Create tables if they don't exist
      await this.createTables();
      this.logger.info('Enhanced database service initialized');
    } catch (error) {
      this.logger.error('Database initialization error', error);
    }
  }

  async createTables() {
    // This would typically be done via migrations
    const tables = [
      `CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        subscription_tier TEXT DEFAULT 'basic',
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS digital_twins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        config JSONB DEFAULT '{}',
        model_url TEXT,
        thumbnail TEXT,
        status TEXT DEFAULT 'active',
        created_by UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS sensors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        digital_twin_id UUID REFERENCES digital_twins(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        position JSONB DEFAULT '{}',
        config JSONB DEFAULT '{}',
        thresholds JSONB DEFAULT '{}',
        unit TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS sensor_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
        digital_twin_id UUID REFERENCES digital_twins(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT NOW(),
        value JSONB NOT NULL,
        metadata JSONB DEFAULT '{}',
        processed_at TIMESTAMP DEFAULT NOW()
      )`
    ];

    for (const table of tables) {
      await this.supabase.rpc('exec_sql', { sql: table });
    }
  }

  async createDigitalTwin(twinData) {
    if (!this.tenantContext) {
      throw new Error('Tenant context required');
    }

    const { data, error } = await this.supabase
      .from('digital_twins')
      .insert([{
        ...twinData,
        tenant_id: this.tenantContext
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDigitalTwins() {
    if (!this.tenantContext) {
      throw new Error('Tenant context required');
    }

    const { data, error } = await this.supabase
      .from('digital_twins')
      .select(`
        *,
        sensors(*)
      `)
      .eq('tenant_id', this.tenantContext);

    if (error) throw error;
    return data || [];
  }

  async storeSensorData(digitalTwinId, sensorData) {
    const records = [];
    
    // Convert your existing sensor data format to individual sensor records
    Object.entries(sensorData).forEach(([category, data]) => {
      if (category !== 'timestamp') {
        Object.entries(data).forEach(([sensorName, value]) => {
          records.push({
            digital_twin_id: digitalTwinId,
            sensor_id: `${digitalTwinId}_${category}_${sensorName}`,
            timestamp: sensorData.timestamp,
            value: { [sensorName]: value },
            metadata: { category }
          });
        });
      }
    });

    const { error } = await this.supabase
      .from('sensor_data')
      .insert(records);

    if (error) {
      this.logger.error('Failed to store sensor data', error);
    }
  }
}
