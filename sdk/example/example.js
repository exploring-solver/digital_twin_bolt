// ===== Package.json for npm distribution =====
/*
{
  "name": "@digitaltwin/sdk",
  "version": "1.0.0",
  "description": "Official SDK for Digital Twin Platform - Connect sensors and devices easily",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "lint": "eslint src/",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "iot",
    "digital-twin",
    "sensors",
    "mqtt",
    "real-time",
    "monitoring"
  ],
  "author": "Digital Twin Platform",
  "license": "MIT",
  "dependencies": {
    "mqtt": "^4.3.7",
    "axios": "^1.3.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^4.9.0",
    "rollup": "^3.0.0",
    "jest": "^29.0.0",
    "eslint": "^8.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/digital-twin-sdk"
  },
  "bugs": {
    "url": "https://github.com/yourusername/digital-twin-sdk/issues"
  },
  "homepage": "https://github.com/yourusername/digital-twin-sdk#readme"
}
*/

// ===== Installation and Usage Examples =====

// NPM Installation
/*
npm install @digitaltwin/sdk
# or
yarn add @digitaltwin/sdk
*/

// Browser Usage Example
import { TwinSDK } from '@digitaltwin/sdk';

const sdk = TwinSDK.init({
  projectToken: 'dt_abc123xyz',
  sensorId: 'browser-sensor-01',
  projectId: 'project-123',
  apiBaseUrl: 'https://your-platform.com/api'
});

// Register sensor
await sdk.registerSensor({
  type: 'environmental',
  name: 'Browser Environmental Sensor',
  location: 'User Browser'
});

// Send data
await sdk.sendData({
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  screenResolution: `${screen.width}x${screen.height}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
});