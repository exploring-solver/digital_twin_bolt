# SCADA-Powered 3D Digital Twin Platform

A modular, real-time digital twin platform that visualizes industrial SCADA data in an interactive 3D environment. This foundational module establishes the infrastructure for future AI, simulation, and voice twin capabilities.

## 🎯 Features

### Phase 1 (Current)
- **Real-time SCADA Data Visualization**: Live sensor data displayed in 3D industrial environment
- **WebSocket Integration**: Sub-100ms latency from sensor to 3D visualization
- **Modular Architecture**: Component-based design for easy extensibility
- **Mock Data Generation**: Python-based SCADA simulator for development and testing
- **Supabase Integration**: Real-time database for sensor data persistence
- **Interactive 3D Scene**: Three.js-powered industrial equipment visualization
- **Status Monitoring**: Real-time sensor status with color-coded alerts

### Future Phases (Extensibility Hooks)
- **Phase 2**: Advanced analytics and historical data visualization
- **Phase 3**: AI-powered anomaly detection and predictive maintenance
- **Phase 4**: Voice twin integration with natural language queries

## 🏗️ Architecture

```
/project-root
  /backend
    ├── scada_listener.js          # WebSocket server for real-time data
    ├── mock_data_gen.py           # SCADA data simulator
    └── supabase_client.js         # Database integration
  /frontend
    /components
      ├── SceneCanvas.jsx          # Three.js 3D scene
      ├── ModelLoader.jsx          # 3D equipment models
      ├── DeviceMapper.jsx         # Data-to-visual mapping
      └── SensorPanel.jsx          # SCADA monitoring panel
    /store
      └── digitalTwinStore.js      # Zustand state management
    /utils
      ├── syncFromPhysical.js      # Real-time synchronization
      └── config.json              # Sensor-to-3D mappings
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Modern web browser with WebGL support

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Start the SCADA WebSocket server** (in a new terminal):
   ```bash
   npm run backend
   ```

4. **Start mock data generation** (in another terminal):
   ```bash
   npm run mock-data
   ```

The application will be available at `http://localhost:3000`

## 📊 Sensor Types & Monitoring

The platform currently simulates and visualizes:

- **Temperature Sensors**: Pump, vessel, and flow temperatures
- **Pressure Sensors**: System pressure monitoring
- **Flow Sensors**: Fluid flow rate measurement
- **Vibration Sensors**: Equipment health monitoring

### Status Thresholds
- **Normal**: Green indicators, optimal operating range
- **Warning**: Yellow indicators, approaching limits
- **Critical**: Red indicators, immediate attention required

## 🔧 Configuration

### Sensor Mappings
Edit `src/utils/config.json` to configure:
- Sensor-to-3D object mappings
- Visual transformation rules
- Device type definitions
- SCADA connection settings

### Example Mapping
```json
{
  "pump_001_temp": {
    "objectId": "pump_001",
    "property": "color",
    "transform": {
      "type": "color",
      "ranges": [
        { "min": 0, "max": 60, "color": "#10b981" },
        { "min": 60, "max": 80, "color": "#f59e0b" },
        { "min": 80, "max": 100, "color": "#ef4444" }
      ]
    }
  }
}
```

## 🗄️ Database Setup (Optional)

To enable data persistence and historical analysis:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database migrations** in your Supabase SQL editor:
   ```sql
   -- Create devices table
   CREATE TABLE devices (
     device_id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     type TEXT NOT NULL,
     status TEXT DEFAULT 'unknown',
     last_update TIMESTAMPTZ DEFAULT NOW(),
     metadata JSONB DEFAULT '{}'
   );

   -- Create sensors table
   CREATE TABLE sensors (
     id BIGSERIAL PRIMARY KEY,
     sensor_id TEXT NOT NULL,
     device_id TEXT REFERENCES devices(device_id),
     type TEXT NOT NULL,
     value NUMERIC NOT NULL,
     unit TEXT,
     quality TEXT DEFAULT 'good',
     timestamp TIMESTAMPTZ DEFAULT NOW()
   );

   -- Create alarms table
   CREATE TABLE alarms (
     alarm_id TEXT PRIMARY KEY,
     device_id TEXT REFERENCES devices(device_id),
     sensor_id TEXT,
     severity TEXT NOT NULL,
     message TEXT NOT NULL,
     value NUMERIC,
     threshold NUMERIC,
     acknowledged BOOLEAN DEFAULT FALSE,
     acknowledged_by TEXT,
     acknowledged_at TIMESTAMPTZ,
     timestamp TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
   ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
   ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;

   -- Create policies (adjust based on your auth requirements)
   CREATE POLICY "Allow all operations" ON devices FOR ALL USING (true);
   CREATE POLICY "Allow all operations" ON sensors FOR ALL USING (true);
   CREATE POLICY "Allow all operations" ON alarms FOR ALL USING (true);
   ```

3. **Configure environment variables** in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🎮 Usage

### Real-time Monitoring
- **3D Scene**: Interact with the 3D environment using mouse controls
- **Sensor Panel**: Monitor real-time sensor values and status
- **Device Selection**: Click on devices in the 3D scene or sensor panel for details

### Data Simulation
The mock data generator creates realistic sensor patterns including:
- Normal operational variance
- Gradual drift over time
- Cyclic patterns (daily/operational cycles)
- Occasional anomalies and spikes

### Visual Feedback
- **Color Coding**: Equipment changes color based on sensor status
- **Animations**: Rotating components indicate active operation
- **Status Indicators**: LED-style indicators show real-time status

## 🔌 Extensibility

The platform is designed for future enhancements:

### Phase 2 Hooks
```javascript
// Historical data analysis
function analyzeHistoricalTrends(sensorId, timeRange) { /* TODO */ }

// Advanced visualization
function renderHeatMaps(data) { /* TODO */ }
```

### Phase 3 Hooks
```javascript
// AI anomaly detection
function runAnomalyDetection(data) { /* TODO */ }

// Predictive maintenance
function predictMaintenanceNeeds(deviceId) { /* TODO */ }

// Simulation engine
function simulateStateChange(params) { /* TODO */ }
```

### Phase 4 Hooks
```javascript
// Voice twin integration
function getVoiceCommandResponse(query) { /* TODO */ }

// Natural language processing
function processVoiceQuery(audio) { /* TODO */ }
```

## 🛠️ Development

### Adding New Sensors
1. Update `backend/mock_data_gen.py` with new sensor configuration
2. Add mapping in `src/utils/config.json`
3. Update 3D models in `src/components/ModelLoader.jsx`

### Custom 3D Models
Replace placeholder geometries with GLB models:
```javascript
import { useGLTF } from '@react-three/drei'

function CustomModel({ url }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}
```

### Real SCADA Integration
Replace WebSocket mock server with actual SCADA protocols:
- Modbus TCP/IP
- OPC UA
- MQTT
- DNP3

## 📈 Performance

- **Latency**: <100ms from sensor update to 3D visualization
- **Update Rate**: 1Hz default (configurable)
- **Concurrent Sensors**: Tested with 50+ sensors
- **Browser Compatibility**: Modern browsers with WebGL 2.0

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the modular architecture patterns
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Supabase Documentation](https://supabase.com/docs)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**Built with ❤️ for the Industrial IoT community**