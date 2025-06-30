import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mqtt from 'mqtt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { EnhancedDatabaseService } from './services/EnhancedDatabaseService.js';
import { DigitalTwinService } from './services/DigitalTwinService.js';
import { SensorRegistrationService } from './services/SensorRegistrationService.js';
import { MQTTBrokerService } from './services/MQTTBrokerService.js';
import { LoggingService } from './services/LoggingService.js';

const app = express();
export const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

export const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize services
const logger = new LoggingService();
const databaseService = new EnhancedDatabaseService();
const digitalTwinService = new DigitalTwinService();
const sensorService = new SensorRegistrationService();
const mqttService = new MQTTBrokerService();

// Store active connections and subscriptions
const twinSubscriptions = new Map();
const projectTokens = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    // if (err) return res.sendStatus(403);
    // req.user = user;
    next();
  });
};

// Project token middleware
const authenticateProjectToken = async (req, res, next) => {
  const projectToken = req.headers['x-project-token'];
  
  if (!projectToken) {
    return res.status(401).json({ error: 'Project token required' });
  }

  try {
    const projectData = await sensorService.validateProjectToken(projectToken);
    if (!projectData) {
      return res.status(403).json({ error: 'Invalid project token' });
    }
    
    req.project = projectData;
    next();
  } catch (error) {
    logger.error('Project token validation failed', error);
    res.status(500).json({ error: 'Token validation failed' });
  }
};

// ===== API Routes =====

// Project and Token Management
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await sensorService.createProject({
      name,
      description,
      userId: req.user.id,
      tenantId: req.user.tenantId
    });
    
    res.json(project);
  } catch (error) {
    logger.error('Failed to create project', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await sensorService.getProjectsByUser(req.user.id);
    res.json(projects);
  } catch (error) {
    logger.error('Failed to fetch projects', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Digital Twin Management
app.get('/api/tenants/:tenantId/twins', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const twins = await digitalTwinService.getTwins(tenantId);
    res.json(twins);
  } catch (error) {
    logger.error('Failed to fetch twins', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tenants/:tenantId/twins', authenticateToken, async (req, res) => {
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

app.put('/api/twins/:twinId', authenticateToken, async (req, res) => {
  try {
    const { twinId } = req.params;
    const updates = req.body;
    const updatedTwin = await digitalTwinService.updateTwinConfiguration(twinId, updates);
    res.json(updatedTwin);
  } catch (error) {
    logger.error('Failed to update twin', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sensor Registration and Management
app.post('/api/sensors/register', authenticateProjectToken, async (req, res) => {
  try {
    const { sensorType, sensorId, metadata } = req.body;
    const sensor = await sensorService.registerSensor({
      projectId: req.project.id,
      sensorType,
      sensorId,
      metadata
    });
    
    res.json(sensor);
  } catch (error) {
    logger.error('Failed to register sensor', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/twins/:twinId/sensors', authenticateToken, async (req, res) => {
  try {
    const { twinId } = req.params;
    const sensors = await sensorService.getSensorsByTwin(twinId);
    res.json(sensors);
  } catch (error) {
    logger.error('Failed to fetch sensors', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/twins/:twinId/sensors', authenticateToken, async (req, res) => {
  try {
    const { twinId } = req.params;
    const sensorData = req.body;
    const sensor = await sensorService.addSensorToTwin(twinId, sensorData);
    res.json(sensor);
  } catch (error) {
    logger.error('Failed to add sensor to twin', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/sensors/:sensorId/position', authenticateToken, async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { position } = req.body;
    await sensorService.updateSensorPosition(sensorId, position);
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to update sensor position', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Twin Operations and Controls
app.post('/api/twins/:twinId/operations', authenticateToken, async (req, res) => {
  try {
    const { twinId } = req.params;
    const { operation, parameters } = req.body;
    
    // Publish operation command via MQTT
    const topic = `twins/${twinId}/commands`;
    const payload = {
      operation,
      parameters,
      timestamp: new Date().toISOString(),
      userId: req.user.id
    };
    
    await mqttService.publish(topic, JSON.stringify(payload));
    
    // Store command in database for history
    await sensorService.storeCommand(twinId, payload);
    
    res.json({ success: true, commandId: uuidv4() });
  } catch (error) {
    logger.error('Failed to execute operation', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data ingestion endpoint for HTTP-based sensors
app.post('/api/data/ingest', authenticateProjectToken, async (req, res) => {
  try {
    const { sensorId, reading, timestamp } = req.body;
    
    const dataPoint = {
      projectId: req.project.id,
      sensorId,
      reading,
      timestamp: timestamp || new Date().toISOString(),
      source: 'http'
    };
    
    await processSensorData(dataPoint);
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to ingest data', error);
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

// ===== MQTT Integration =====

const processSensorData = async (dataPoint) => {
  try {
    // Store raw data
    await databaseService.storeSensorData(dataPoint);
    
    // Get twin ID from sensor mapping
    const twinId = await sensorService.getTwinIdBySensor(dataPoint.sensorId);
    
    if (twinId && twinSubscriptions.has(twinId)) {
      // Broadcast to connected clients
      io.to(`twin_${twinId}`).emit('sensor_data', {
        twinId,
        sensorId: dataPoint.sensorId,
        data: dataPoint
      });
      
      // Check for alerts
      const alerts = await sensorService.checkAlerts(dataPoint);
      if (alerts.length > 0) {
        io.to(`twin_${twinId}`).emit('twin_alerts', {
          twinId,
          alerts
        });
      }
    }
  } catch (error) {
    logger.error('Failed to process sensor data', error);
  }
};

// Initialize MQTT broker connection
export const initializeMQTT = async () => {
  try {
    await mqttService.connect();
    
    // Subscribe to all sensor data topics
    mqttService.subscribe('sensors/+/+/data', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        const topicParts = topic.split('/');
        const projectId = topicParts[1];
        const sensorId = topicParts[2];
        
        const dataPoint = {
          projectId,
          sensorId,
          reading: data.reading,
          timestamp: data.timestamp || new Date().toISOString(),
          source: 'mqtt'
        };
        
        await processSensorData(dataPoint);
      } catch (error) {
        logger.error('Failed to process MQTT message', error);
      }
    });
    
    // Subscribe to twin command responses
    mqttService.subscribe('twins/+/responses', (topic, message) => {
      try {
        const response = JSON.parse(message.toString());
        const twinId = topic.split('/')[1];
        
        io.to(`twin_${twinId}`).emit('command_response', response);
      } catch (error) {
        logger.error('Failed to process command response', error);
      }
    });
    
    logger.info('MQTT broker initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize MQTT broker', error);
  }
};
