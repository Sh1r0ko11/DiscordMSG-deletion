import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Gamepad2, 
  Activity, 
  Rocket, 
  Square, 
  Clipboard,
  Trash2,
  Download,
  Moon,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

const MainContent = ({ 
  channelId, 
  setChannelId, 
  selectedTimeRange, 
  setSelectedTimeRange,
  isRunning,
  onStart,
  onStop,
  logs,
  onClearLogs
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [cooldownTime, setCooldownTime] = useState(8);

  const timeOptions = [
    { value: '30m', label: '30m', color: '#43b581' },
    { value: '1h', label: '1h', color: '#43b581' },
    { value: '2h', label: '2h', color: '#faa61a' },
    { value: '6h', label: '6h', color: '#faa61a' },
    { value: '12h', label: '12h', color: '#f04747' },
    { value: '24h', label: '24h', color: '#f04747' },
    { value: '48h', label: '48h', color: '#f04747' },
    { value: 'All', label: 'All', color: '#ed4245' }
  ];

  const handleStart = () => {
    if (selectedTimeRange === 'All') {
      setShowConfirmModal(true);
    } else {
      onStart(customMessage, cooldownTime);
    }
  };

  const confirmStart = () => {
    setShowConfirmModal(false);
    onStart(customMessage, cooldownTime);
  };

  const pasteChannelId = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setChannelId(text);
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  const exportLogs = () => {
    const logText = logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ex01-log-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={14} />;
      case 'error': return <XCircle size={14} />;
      case 'warning': return <AlertTriangle size={14} />;
      default: return <Activity size={14} />;
    }
  };

  return (
    <motion.div 
      className="main-content"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div 
        className="main-header"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="header-title">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Zap />
            </motion.div>
            DiscordMSG Deletion Tool
          </motion.h1>
          <p>Message Management</p>
        </div>
        
        <div className="header-actions">
          <motion.button
            className="theme-toggle"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            <Moon size={20} />
          </motion.button>
        </div>
      </motion.div>

      {/* Configuration Panel */}
      <motion.div 
        className="config-panel"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="panel-header">
          <Settings size={20} />
          <h2>Target Configuration</h2>
        </div>
        
        <div className="config-grid">
          <motion.div 
            className="config-item"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <label>Channel/DM ID</label>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter channel or DM ID"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
              />
              <motion.button
                className="input-btn"
                onClick={pasteChannelId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Paste from clipboard"
              >
                <Clipboard size={16} />
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            className="config-item"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <label>Time Range</label>
            <div className="time-options">
              {timeOptions.map((option, index) => (
                <motion.div
                  key={option.value}
                  className={`time-option ${selectedTimeRange === option.value ? 'active' : ''} ${option.value === 'All' ? 'danger' : ''}`}
                  onClick={() => setSelectedTimeRange(option.value)}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: 0.7 + index * 0.05,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -2,
                    boxShadow: `0 8px 25px ${option.color}40`
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    '--option-color': option.color
                  }}
                >
                  {option.label}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="config-item"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            <label>Custom Message (Optional)</label>
            <div className="input-group">
              <textarea
                placeholder="Enter custom message to send before deletion (leave empty for default)"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>
          </motion.div>

          <motion.div 
            className="config-item"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.3 }}
          >
            <label>Cooldown Time (seconds)</label>
            <div className="input-group">
              <input
                type="number"
                min="1"
                max="60"
                placeholder="Cooldown in seconds"
                value={cooldownTime}
                onChange={(e) => setCooldownTime(parseInt(e.target.value) || 8)}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Control Panel */}
      <motion.div 
        className="control-panel"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="panel-header">
          <Gamepad2 size={20} />
          <h2>Control Panel</h2>
        </div>
        
        <div className="control-buttons">
          <motion.button
            className={`btn btn-primary ${isRunning ? 'running' : ''}`}
            onClick={handleStart}
            disabled={isRunning}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
            whileHover={!isRunning ? { 
              scale: 1.02,
              boxShadow: "0 10px 30px rgba(88, 101, 242, 0.4)"
            } : {}}
            whileTap={!isRunning ? { scale: 0.98 } : {}}
          >
            <motion.div
              animate={isRunning ? { 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              } : {}}
              transition={isRunning ? { 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              } : {}}
            >
              <Rocket size={20} />
            </motion.div>
            <span>Initialize Ex01 Protocol</span>
            <div className="btn-glow" />
          </motion.button>
          
          <motion.button
            className="btn btn-danger"
            onClick={onStop}
            disabled={!isRunning}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
            whileHover={isRunning ? { 
              scale: 1.02,
              boxShadow: "0 10px 30px rgba(237, 66, 69, 0.4)"
            } : {}}
            whileTap={isRunning ? { scale: 0.98 } : {}}
          >
            <Square size={20} />
            <span>Emergency Stop</span>
          </motion.button>
        </div>

        <motion.div 
          className="status-display"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.3 }}
        >
          <div className={`status-item ${isRunning ? 'active' : 'ready'}`}>
            <motion.div
              className="status-icon"
              animate={isRunning ? { 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              } : {}}
              transition={isRunning ? { 
                duration: 2,
                repeat: Infinity
              } : {}}
            >
              {isRunning ? <Activity size={16} /> : <CheckCircle size={16} />}
            </motion.div>
            <span>{isRunning ? 'Protocol Active' : 'System Ready'}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Activity Monitor */}
      <motion.div 
        className="activity-panel"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <div className="panel-header">
          <Activity size={20} />
          <h2>Live Activity Monitor</h2>
          <div className="monitor-controls">
            <motion.button
              className="btn-icon"
              onClick={onClearLogs}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Clear log"
            >
              <Trash2 size={16} />
            </motion.button>
            <motion.button
              className="btn-icon"
              onClick={exportLogs}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Export log"
            >
              <Download size={16} />
            </motion.button>
          </div>
        </div>
        
        <div className="log-container">
          <div className="log-content">
            <AnimatePresence>
              {logs.map((log, index) => (
                <motion.div
                  key={log.id}
                  className={`log-entry ${log.type}`}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    x: 4
                  }}
                >
                  <span className="log-time">[{log.timestamp}]</span>
                  <div className="log-icon">
                    {getLogIcon(log.type)}
                  </div>
                  <span className="log-message">{log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {logs.length === 0 && (
              <motion.div
                className="log-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <Activity size={32} />
                <span>Waiting for activity...</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              className="modal"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>⚠️ Confirm Deletion</h3>
                <motion.button
                  className="modal-close"
                  onClick={() => setShowConfirmModal(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </div>
              <div className="modal-body">
                <div className="warning-icon">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity
                    }}
                  >
                    <AlertTriangle size={48} />
                  </motion.div>
                </div>
                <p>You are about to delete <strong>ALL</strong> your messages in this channel. This action cannot be undone. Are you absolutely sure?</p>
              </div>
              <div className="modal-footer">
                <motion.button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="btn btn-danger"
                  onClick={confirmStart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Yes, Delete All
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MainContent;