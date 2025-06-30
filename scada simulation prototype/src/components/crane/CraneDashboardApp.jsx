import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock 3D Scene Component (replace with your actual 3D component)
const SceneCanvas = ({ sensorData }) => {
    return (
        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
            {/* 3D Scene Placeholder */}
            <motion.div
                className="relative w-full h-full flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                {/* Animated crane representation */}
                <motion.div
                    className="relative"
                    animate={{
                        rotateY: [0, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    <div className="text-9xl filter drop-shadow-2xl">🏗️</div>
                </motion.div>

                {/* Data visualization overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    {sensorData && Object.entries(sensorData).map(([key, value], index) => (
                        <motion.div
                            key={key}
                            className="absolute bg-blue-500/80 text-white p-2 rounded-lg text-sm"
                            style={{
                                top: `${20 + index * 15}%`,
                                left: `${10 + index * 20}%`,
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                        </motion.div>
                    ))}
                </div>

                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full">
                        <defs>
                            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" className="text-blue-400" />
                    </svg>
                </div>
            </motion.div>
        </div>
    );
};

const SensorPanel = ({ sensorData, isConnected, connectionStatus }) => {
    const sensors = [
        { id: 'load', name: 'Load Weight', unit: 'kg', icon: '⚖️', color: 'text-yellow-400' },
        { id: 'position', name: 'Position', unit: 'm', icon: '📍', color: 'text-blue-400' },
        { id: 'temperature', name: 'Temperature', unit: '°C', icon: '🌡️', color: 'text-red-400' },
        { id: 'vibration', name: 'Vibration', unit: 'Hz', icon: '📳', color: 'text-purple-400' },
        { id: 'speed', name: 'Speed', unit: 'm/s', icon: '⚡', color: 'text-green-400' },
        { id: 'pressure', name: 'Hydraulic Pressure', unit: 'bar', icon: '💧', color: 'text-cyan-400' },
    ];

    const getSensorValue = (sensorId) => {
        if (!sensorData) return Math.random() * 100;
        return sensorData[sensorId] || Math.random() * 100;
    };

    const getSensorStatus = (value, sensorId) => {
        if (sensorId === 'temperature' && value > 80) return 'danger';
        if (sensorId === 'load' && value > 90) return 'warning';
        if (value > 85) return 'warning';
        return 'normal';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'danger': return 'bg-red-500/20 border-red-500 text-red-400';
            case 'warning': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
            default: return 'bg-green-500/20 border-green-500 text-green-400';
        }
    };

    return (
        <div className="space-y-4">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2">Sensor Readings</h2>
                <div className="flex items-center gap-2">
                    <motion.div
                        className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                        animate={isConnected ? {
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-sm text-slate-300">{connectionStatus || 'Connecting...'}</span>
                </div>
            </div>

            <div className="space-y-3">
                {sensors.map((sensor, index) => {
                    const value = getSensorValue(sensor.id);
                    const status = getSensorStatus(value, sensor.id);

                    return (
                        <motion.div
                            key={sensor.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${getStatusColor(status)}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <motion.span
                                        className="text-lg"
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                    >
                                        {sensor.icon}
                                    </motion.span>
                                    <span className="font-medium">{sensor.name}</span>
                                </div>
                                <span className={`text-sm px-2 py-1 rounded ${status === 'danger' ? 'bg-red-500/30' :
                                        status === 'warning' ? 'bg-yellow-500/30' : 'bg-green-500/30'
                                    }`}>
                                    {status.toUpperCase()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <motion.span
                                    className="text-2xl font-bold"
                                    animate={{
                                        textShadow: status === 'danger' ? [
                                            "0 0 0px rgba(239, 68, 68, 0)",
                                            "0 0 20px rgba(239, 68, 68, 0.8)",
                                            "0 0 0px rgba(239, 68, 68, 0)"
                                        ] : []
                                    }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    {value.toFixed(1)}
                                </motion.span>
                                <span className="text-sm opacity-70">{sensor.unit}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                                <motion.div
                                    className={`h-2 rounded-full ${status === 'danger' ? 'bg-red-500' :
                                            status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(value, 100)}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

const AlertsPanel = ({ alerts, onDismissAlert }) => {
    const getAlertIcon = (type) => {
        switch (type) {
            case 'critical': return '🚨';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📢';
        }
    };

    const getAlertColor = (type) => {
        switch (type) {
            case 'critical': return 'bg-red-500/20 border-red-500 text-red-400';
            case 'warning': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
            case 'info': return 'bg-blue-500/20 border-blue-500 text-blue-400';
            default: return 'bg-gray-500/20 border-gray-500 text-gray-400';
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Active Alerts</h3>

            <AnimatePresence>
                {alerts && alerts.length > 0 ? alerts.slice(0, 5).map((alert, index) => (
                    <motion.div
                        key={`${alert.message}-${index}`}
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        className={`p-3 rounded-lg border backdrop-blur-sm ${getAlertColor(alert.type)} cursor-pointer group`}
                        onClick={() => onDismissAlert(index)}
                    >
                        <div className="flex items-start gap-3">
                            <motion.span
                                className="text-lg flex-shrink-0"
                                animate={{
                                    scale: alert.type === 'critical' ? [1, 1.2, 1] : [1],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: alert.type === 'critical' ? Infinity : 0
                                }}
                            >
                                {getAlertIcon(alert.type)}
                            </motion.span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{alert.message}</p>
                                {alert.timestamp && (
                                    <p className="text-xs opacity-70 mt-1">
                                        {new Date(alert.timestamp).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                            <motion.button
                                className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 bg-white/10 rounded transition-opacity"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                ×
                            </motion.button>
                        </div>
                    </motion.div>
                )) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-4 text-gray-400"
                    >
                        <div className="text-3xl mb-2">✅</div>
                        <p className="text-sm">No active alerts</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const CraneDashboardApp = ({
    sensorData,
    alerts,
    onDismissAlert,
    onNavigateBack,
    isConnected
}) => {
    const [connectionStatus, setConnectionStatus] = useState('Connected');
    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        setConnectionStatus(isConnected ? 'Connected' : 'Disconnected');
    }, [isConnected]);

    return (
        <div className="min-h-screen bg-slate-900 flex relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                        }}
                        animate={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                        }}
                        transition={{
                            duration: Math.random() * 20 + 10,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                    />
                ))}
            </div>

            {/* Left Panel - SCADA Controls */}
            <motion.div
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: showControls ? 0 : -280, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="w-80 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700 p-4 relative z-10 shadow-2xl"
            >
                {/* Header */}
                <motion.div
                    className="mb-6"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <motion.h1
                            className="text-2xl font-bold text-white"
                            animate={{
                                textShadow: [
                                    "0 0 20px rgba(59, 130, 246, 0.5)",
                                    "0 0 30px rgba(59, 130, 246, 0.8)",
                                    "0 0 20px rgba(59, 130, 246, 0.5)",
                                ],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            Digital Twin Platform
                        </motion.h1>
                        <motion.button
                            onClick={onNavigateBack}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            title="Back to Main Dashboard"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </motion.button>
                    </div>

                    <motion.div
                        className="flex items-center gap-2"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <motion.div
                            className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                            animate={isConnected ? {
                                boxShadow: [
                                    "0 0 0 0 rgba(34, 197, 94, 0.7)",
                                    "0 0 0 10px rgba(34, 197, 94, 0)",
                                ],
                            } : {
                                boxShadow: [
                                    "0 0 0 0 rgba(239, 68, 68, 0.7)",
                                    "0 0 0 10px rgba(239, 68, 68, 0)",
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-sm text-slate-300">{connectionStatus}</span>
                    </motion.div>
                </motion.div>

                {/* Sensor Panel */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <SensorPanel
                        sensorData={sensorData}
                        isConnected={isConnected}
                        connectionStatus={connectionStatus}
                    />
                </motion.div>

                {/* Alerts Panel */}
                <motion.div
                    className="mt-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <AlertsPanel alerts={alerts} onDismissAlert={onDismissAlert} />
                </motion.div>

                {/* Control Actions */}
                <motion.div
                    className="mt-6 space-y-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <h3 className="text-lg font-semibold text-white">Quick Controls</h3>

                    <motion.button
                        className="w-full p-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.span
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            ▶️
                        </motion.span>
                        <span>Start Operation</span>
                    </motion.button>

                    <motion.button
                        className="w-full p-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.span
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            ⏹️
                        </motion.span>
                        <span>Emergency Stop</span>
                    </motion.button>

                    <motion.button
                        className="w-full p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.span
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            🔧
                        </motion.span>
                        <span>Maintenance Mode</span>
                    </motion.button>
                </motion.div>
            </motion.div>

            {/* Toggle button for left panel */}
            <motion.button
                onClick={() => setShowControls(!showControls)}
                className="absolute left-80 top-4 z-20 p-2 bg-slate-800/90 hover:bg-slate-700/90 text-white rounded-r-lg border border-l-0 border-slate-600 transition-all duration-300"
                style={{ left: showControls ? '320px' : '40px' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <motion.svg
                    className="w-4 h-4"
                    animate={{ rotate: showControls ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </motion.svg>
            </motion.button>

            {/* Main 3D Scene */}
            <motion.div
                className="flex-1 relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
            >
                <SceneCanvas sensorData={sensorData} />

                {/* Overlay Controls */}
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
            </motion.div>
        </div>
    );
};