import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

export const TenantOverview = ({ tenant, twins, onTwinSelect, onViewChange }) => {
  const [hoveredStat, setHoveredStat] = useState(null);
  const [particles, setParticles] = useState([]);
  const [statsData, setStatsData] = useState({
    activeTwins: 0,
    activeAlerts: 0,
  });
  const controls = useAnimation();

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
    }));
    setParticles(newParticles);
  }, []);

  // Calculate stats only once on mount or when twins change
  useEffect(() => {
    // Assign a status to each twin once
    const twinStatuses = twins.map(() => Math.random() > 0.1 ? 'online' : 'offline');
    const activeTwins = twinStatuses.filter(status => status === 'online').length;
    const activeAlerts = Math.floor(Math.random() * 8);

    setStatsData({
      activeTwins,
      activeAlerts,
      twinStatuses, // Save if you want to use for rendering twins
    });
  }, [twins]);

  const getTwinIcon = (twinType) => {
    const icons = {
      crane: '🏗️',
      building: '🏢',
      factory: '🏭',
      vehicle: '🚛',
      pump: '⚙️'
    };
    return icons[twinType] || '📊';
  };

  const getTwinStatus = () => Math.random() > 0.1 ? 'online' : 'offline';
  
  const getStatusColor = (status) => {
    return status === 'online' ? 'text-green-400' : 'text-red-400';
  };

  const stats = [
    {
      title: 'Total Twins',
      value: twins.length,
      icon: '🌐',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      title: 'Active Twins',
      value: statsData.activeTwins,
      icon: '✅',
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      title: 'Total Sensors',
      value: twins.reduce((acc, twin) => acc + (twin.sensors?.length || 4), 0),
      icon: '📡',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      title: 'Active Alerts',
      value: statsData.activeAlerts,
      icon: '⚠️',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      gradient: 'from-yellow-500/20 to-orange-500/20'
    }
  ];

  const recentActivity = [
    { time: '2 mins ago', action: 'Crane Twin - Load limit exceeded', type: 'warning', icon: '🏗️' },
    { time: '15 mins ago', action: 'Building Twin - HVAC system optimized', type: 'success', icon: '🏢' },
    { time: '1 hour ago', action: 'Factory Twin - Production milestone reached', type: 'info', icon: '🏭' },
    { time: '2 hours ago', action: 'New sensor added to Vehicle Twin', type: 'info', icon: '🚛' },
    { time: '3 hours ago', action: 'System maintenance completed', type: 'success', icon: '⚙️' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      case 'error': return '❌';
      default: return '📋';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'success': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'info': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.8 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 relative overflow-hidden">
      {/* Floating particles background */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            initial={{ x: particle.x, y: particle.y }}
            animate={{
              y: [particle.y, particle.y - 100, particle.y],
              x: [particle.x, particle.x + 50, particle.x - 50, particle.x],
            }}
            transition={{
              duration: 10 + particle.speed,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: particle.size,
              height: particle.size,
            }}
          />
        ))}
      </div>

      {/* Welcome Header */}
      <motion.div 
        className="text-center mb-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="relative inline-block"
        >
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 relative"
            animate={{
              textShadow: [
                "0 0 20px rgb(59, 130, 246, 0.5)",
                "0 0 30px rgb(59, 130, 246, 0.8)",
                "0 0 20px rgb(59, 130, 246, 0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Welcome to {tenant?.name || 'Digital Twin Platform'}
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-lg"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.h1>
        </motion.div>
        
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto"
        >
          Manage and monitor your digital twins from one central dashboard
        </motion.p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05, 
              rotateY: 5,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onHoverStart={() => setHoveredStat(index)}
            onHoverEnd={() => setHoveredStat(null)}
            className={`relative p-6 rounded-xl border backdrop-blur-sm cursor-pointer transform-gpu ${stat.color} overflow-hidden group`}
          >
            {/* Animated background gradient */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100`}
              transition={{ duration: 0.3 }}
            />
            
            {/* Glowing border effect */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 blur-sm"
              transition={{ duration: 0.3 }}
            />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <motion.div 
                  className="text-sm opacity-80 mb-1"
                  animate={hoveredStat === index ? { x: [0, 5, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {stat.title}
                </motion.div>
                <motion.div 
                  className="text-2xl sm:text-3xl font-bold"
                  animate={hoveredStat === index ? { 
                    scale: [1, 1.1, 1],
                    textShadow: [
                      "0 0 0px rgba(255,255,255,0)",
                      "0 0 20px rgba(255,255,255,0.8)",
                      "0 0 0px rgba(255,255,255,0)"
                    ]
                  } : {}}
                  transition={{ duration: 0.6 }}
                >
                  {stat.value}
                </motion.div>
              </div>
              <motion.div 
                className="text-3xl sm:text-4xl"
                animate={hoveredStat === index ? { 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                } : {}}
                transition={{ duration: 0.8 }}
              >
                {stat.icon}
              </motion.div>
            </div>
            
            {/* Particle burst effect on hover */}
            {hoveredStat === index && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-current rounded-full opacity-60"
                    initial={{ 
                      x: '50%', 
                      y: '50%', 
                      scale: 0 
                    }}
                    animate={{
                      x: `${50 + (Math.cos(i * 45 * Math.PI / 180) * 80)}%`,
                      y: `${50 + (Math.sin(i * 45 * Math.PI / 180) * 80)}%`,
                      scale: [0, 1, 0],
                    }}
                    transition={{ 
                      duration: 1,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Digital Twins Grid */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 relative overflow-hidden group">
            {/* Animated border */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <motion.h3 
                  className="text-xl font-semibold text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  Your Digital Twins
                </motion.h3>
                <motion.button
                  onClick={() => onViewChange('builder')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 flex items-center space-x-2 relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">+</span>
                  <span className="relative z-10">Create Twin</span>
                </motion.button>
              </div>

              {twins.length === 0 ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{
                      rotateY: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🌐
                  </motion.div>
                  <h4 className="text-xl font-semibold text-white mb-2">No Digital Twins Yet</h4>
                  <p className="text-gray-400 mb-6">
                    Create your first digital twin to start monitoring your assets
                  </p>
                  <motion.button
                    onClick={() => onViewChange('builder')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                    <span className="relative z-10">Get Started</span>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {twins.map((twin, index) => {
                    const status = getTwinStatus();
                    return (
                      <motion.div
                        key={twin.id}
                        variants={itemVariants}
                        whileHover={{ 
                          scale: 1.02,
                          rotateY: 2,
                          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                        }}
                        className="bg-gray-700/50 rounded-xl p-4 border border-gray-600 hover:border-gray-500 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                        onClick={() => {
                          onTwinSelect(twin);
                          onViewChange('monitor');
                        }}
                      >
                        {/* Glowing background effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.3 }}
                        />
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <motion.div 
                                className="text-3xl"
                                whileHover={{ 
                                  rotate: [0, -10, 10, 0],
                                  scale: [1, 1.2, 1]
                                }}
                                transition={{ duration: 0.6 }}
                              >
                                {getTwinIcon(twin.type)}
                              </motion.div>
                              <div>
                                <motion.h4 
                                  className="font-semibold text-white group-hover:text-blue-400 transition-colors"
                                  whileHover={{ x: 5 }}
                                >
                                  {twin.name}
                                </motion.h4>
                                <p className="text-sm text-gray-400 capitalize">{twin.type}</p>
                              </div>
                            </div>
                            <motion.div 
                              className={`flex items-center space-x-1 ${getStatusColor(status)}`}
                              whileHover={{ scale: 1.1 }}
                            >
                              <motion.div 
                                className={`w-2 h-2 rounded-full ${
                                  status === 'online' ? 'bg-green-400' : 'bg-red-400'
                                }`}
                                animate={status === 'online' ? {
                                  scale: [1, 1.2, 1],
                                  opacity: [1, 0.8, 1]
                                } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                              <span className="text-xs">{status}</span>
                            </motion.div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Sensors:</span>
                              <motion.span 
                                className="text-white"
                                whileHover={{ scale: 1.05, color: "#60A5FA" }}
                              >
                                {twin.sensors?.length || 4} active
                              </motion.span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Last Update:</span>
                              <span className="text-white">
                                {status === 'online' ? 'Just now' : '2 hours ago'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Health:</span>
                              <motion.span 
                                className="text-green-400"
                                animate={{ 
                                  textShadow: [
                                    "0 0 0px rgba(34, 197, 94, 0)",
                                    "0 0 10px rgba(34, 197, 94, 0.8)",
                                    "0 0 0px rgba(34, 197, 94, 0)"
                                  ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                95%
                              </motion.span>
                            </div>
                          </div>

                          <div className="mt-4 flex space-x-2">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTwinSelect(twin);
                                onViewChange('monitor');
                              }}
                              className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded text-sm transition-all duration-300 relative overflow-hidden"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <motion.div
                                className="absolute inset-0 bg-white/20"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                              />
                              <span className="relative z-10">Monitor</span>
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTwinSelect(twin);
                                onViewChange('analytics');
                              }}
                              className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-all duration-300"
                              whileHover={{ scale: 1.05, rotate: 5 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              📊
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="space-y-6"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5"
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            <div className="relative z-10">
              <motion.h3 
                className="text-xl font-semibold text-white mb-6"
                whileHover={{ scale: 1.05 }}
              >
                Recent Activity
              </motion.h3>
              
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02, 
                      x: 5,
                      boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)"
                    }}
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer ${getActivityColor(activity.type)}`}
                  >
                    <motion.div 
                      className="text-lg flex-shrink-0"
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                    >
                      {activity.icon || getActivityIcon(activity.type)}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <motion.div 
                        className="text-sm text-white"
                        whileHover={{ x: 2 }}
                      >
                        {activity.action}
                      </motion.div>
                      <motion.div 
                        className={`text-xs opacity-80`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {activity.time}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="relative z-10">
              <motion.h3 
                className="text-lg font-semibold text-white mb-4"
                whileHover={{ scale: 1.05 }}
              >
                Quick Actions
              </motion.h3>
              
              <div className="space-y-3">
                <motion.button
                  onClick={() => onViewChange('builder')}
                  className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 flex items-center space-x-3 relative overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ scale: 0, borderRadius: '50%' }}
                    whileHover={{ scale: 1, borderRadius: '0%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.span
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10"
                  >
                    🔧
                  </motion.span>
                  <span className="relative z-10">Create New Twin</span>
                </motion.button>
                
                <motion.button 
                  onClick={() => onViewChange('analytics')}
                  className="w-full p-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-all duration-300 flex items-center space-x-3 relative overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/10"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8 }}
                  />
                  <motion.span
                    whileHover={{ scale: 1.2 }}
                    className="relative z-10"
                  >
                    📊
                  </motion.span>
                  <span className="relative z-10">View Analytics</span>
                </motion.button>
                
                <motion.button 
                  onClick={() => onViewChange('crane-dashboard')}
                  className="w-full p-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all duration-300 flex items-center space-x-3 relative overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 1 }}
                  />
                  <motion.span
                    whileHover={{ y: [-2, -8, -2] }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10"
                  >
                    🏗️
                  </motion.span>
                  <span className="relative z-10">Crane Dashboard</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};