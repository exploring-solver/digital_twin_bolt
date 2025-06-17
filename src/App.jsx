import React, { useEffect } from 'react'
import SceneCanvas from './components/SceneCanvas'
import SensorPanel from './components/SensorPanel'
import { useDigitalTwinStore } from './store/digitalTwinStore'
import { initializeWebSocket } from './utils/syncFromPhysical'

function App() {
  const { isConnected, connectionStatus } = useDigitalTwinStore()

  useEffect(() => {
    // Initialize WebSocket connection for real-time data
    initializeWebSocket()
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Panel - SCADA Controls */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Digital Twin Platform
          </h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-slate-300">{connectionStatus}</span>
          </div>
        </div>
        
        <SensorPanel />
      </div>

      {/* Main 3D Scene */}
      <div className="flex-1 relative">
        <SceneCanvas />
        
        {/* Overlay Controls */}
        <div className="absolute top-4 right-4 scada-panel rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Scene Controls</h3>
          <div className="space-y-2 text-sm">
            <div>Camera: Orbit</div>
            <div>Lighting: Auto</div>
            <div>Quality: High</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App