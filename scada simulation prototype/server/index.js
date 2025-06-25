import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ModbusService } from './services/ModbusService.js';
import { DatabaseService } from './services/DatabaseService.js';
import { LoggingService } from './services/LoggingService.js';
import { SensorDataProcessor } from './services/SensorDataProcessor.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Initialize services
const logger = new LoggingService();
const databaseService = new DatabaseService();
const modbusService = new ModbusService();
const sensorProcessor = new SensorDataProcessor();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/sensors/current', async (req, res) => {
  try {
    const currentData = await sensorProcessor.getCurrentSensorData();
    res.json(currentData);
  } catch (error) {
    logger.error('Failed to fetch current sensor data', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sensors/history', async (req, res) => {
  try {
    const { startTime, endTime, sensorType } = req.query;
    const historyData = await databaseService.getSensorHistory(startTime, endTime, sensorType);
    res.json(historyData);
  } catch (error) {
    logger.error('Failed to fetch sensor history', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('subscribe_sensors', (sensorTypes) => {
    socket.join('sensor_updates');
    logger.info(`Client ${socket.id} subscribed to sensors: ${sensorTypes.join(', ')}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Real-time data processing and broadcasting
const startRealTimeProcessing = () => {
  setInterval(async () => {
    try {
      // Get sensor data from Modbus
      const sensorData = await modbusService.readSensorData();
      
      // Process and validate data
      const processedData = await sensorProcessor.processSensorData(sensorData);
      
      // Store in database
      await databaseService.storeSensorData(processedData);
      
      // Broadcast to connected clients
      io.to('sensor_updates').emit('sensor_data', processedData);
      

      // Check for alerts
      const alerts = sensorProcessor.checkAlerts(processedData);
      if (alerts.length > 0) {
        io.to('sensor_updates').emit('alerts', alerts);
        logger.warn('Alerts triggered', { alerts });
      }
      
    } catch (error) {
      logger.error('Error in real-time processing', error);
    }
  }, 1000); // Update every second
};

// Initialize and start server
const initializeServer = async () => {
  try {
    await databaseService.initialize();
    await modbusService.initialize();
    startRealTimeProcessing();
    
    server.listen(PORT, () => {
      logger.info(`SCADA server running on port ${PORT}`);
      console.log(`🏗️  SCADA Crane System Server started on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to initialize server', error);
    process.exit(1);
  }
};

initializeServer();