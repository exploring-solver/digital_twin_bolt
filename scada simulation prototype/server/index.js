import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { DigitalTwinService } from './services/DigitalTwinService.js';
import { EnhancedDatabaseService } from './services/EnhancedDatabaseService.js';
import { LoggingService } from './services/LoggingService.js';
import { SensorDataProcessor } from './services/SensorDataProcessor.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 3001;

// Initialize services
const logger = new LoggingService();
const databaseService = new EnhancedDatabaseService();
const digitalTwinService = new DigitalTwinService();
const sensorProcessor = new SensorDataProcessor();

// Store active twin subscriptions
const twinSubscriptions = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// ===== API Routes =====

// Tenant management
app.get('/api/tenants/:tenantId/twins', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const twins = await digitalTwinService.getTwins(tenantId);
    res.json(twins);
  } catch (error) {
    logger.error('Failed to fetch twins', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tenants/:tenantId/twins', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const twinConfig = req.body;
    const twin = await digitalTwinService.createTwin(tenantId, twinConfig);
    res.json(twin);
  } catch (error) {
    logger.error('Failed to create twin', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Twin-specific data
app.get('/api/twins/:twinId/data', async (req, res) => {
  try {
    const { twinId } = req.params;
    const currentData = await sensorProcessor.getCurrentTwinData(twinId);
    res.json(currentData);
  } catch (error) {
    logger.error('Failed to fetch twin data', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== WebSocket Management =====

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('subscribe_twin', (twinId) => {
    socket.join(`twin_${twinId}`);
    
    if (!twinSubscriptions.has(twinId)) {
      twinSubscriptions.set(twinId, new Set());
    }
    twinSubscriptions.get(twinId).add(socket.id);
    
    logger.info(`Client ${socket.id} subscribed to twin: ${twinId}`);
  });
  
  socket.on('unsubscribe_twin', (twinId) => {
    socket.leave(`twin_${twinId}`);
    
    if (twinSubscriptions.has(twinId)) {
      twinSubscriptions.get(twinId).delete(socket.id);
      
      if (twinSubscriptions.get(twinId).size === 0) {
        twinSubscriptions.delete(twinId);
      }
    }
    
    logger.info(`Client ${socket.id} unsubscribed from twin: ${twinId}`);
  });
  
  socket.on('disconnect', () => {
    // Clean up subscriptions
    twinSubscriptions.forEach((clients, twinId) => {
      clients.delete(socket.id);
      if (clients.size === 0) {
        twinSubscriptions.delete(twinId);
      }
    });
    
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// ===== Real-time Data Processing =====

const processRealTimeData = async () => {
  try {
    // Get all active twins that have subscriptions
    for (const twinId of twinSubscriptions.keys()) {
      // Generate or fetch real sensor data for this twin
      const sensorData = await generateTwinSensorData(twinId);
      
      // Process and validate data
      const processedData = await sensorProcessor.processSensorData(twinId, sensorData);
      
      // Store in database
      await databaseService.storeSensorData(twinId, processedData);
      
      // Broadcast to subscribers
      io.to(`twin_${twinId}`).emit('twin_data', {
        twinId,
        sensorData: processedData
      });
      
      // Check for alerts
      const alerts = sensorProcessor.checkAlerts(twinId, processedData);
      if (alerts.length > 0) {
        io.to(`twin_${twinId}`).emit('twin_alerts', {
          twinId,
          alerts
        });
        logger.warn(`Alerts triggered for twin ${twinId}`, { alerts });
      }
    }
  } catch (error) {
    logger.error('Error in real-time processing', error);
  }
};

// Generate sensor data based on twin type
const generateTwinSensorData = async (twinId) => {
  // This would integrate with your existing sensor simulation
  // or real hardware connections based on twin configuration
  
  // For now, use the existing crane simulation as default
  // In production, this would be determined by twin type and configuration
  return {
    timestamp: new Date().toISOString(),
    // Your existing sensor data structure
    control: { /* ... */ },
    environmental: { /* ... */ },
    // ... other sensors
  };
};

// Initialize and start server
const initializeServer = async () => {
  try {
    await databaseService.initialize();
    
    // Start real-time processing
    setInterval(processRealTimeData, 1000);
    
    server.listen(PORT, () => {
      logger.info(`Enhanced Digital Twin Platform running on port ${PORT}`);
      console.log(`🌐 Digital Twin Platform started on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to initialize server', error);
    process.exit(1);
  }
};

initializeServer();