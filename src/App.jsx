import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import LoadingScreen from './components/LoadingScreen';
import ParticleBackground from './components/ParticleBackground';
import './styles/App.css';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30m');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [channelId, setChannelId] = useState('');

  // Loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Load friends on startup
  useEffect(() => {
    if (!isLoading) {
      loadFriends();
    }
  }, [isLoading]);

  // App container animation
  const appSpring = useSpring({
    opacity: isLoading ? 0 : 1,
    transform: isLoading ? 'scale(0.95)' : 'scale(1)',
    config: { tension: 200, friction: 25 }
  });

  const loadFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      const data = await response.json();
      
      if (data.success) {
        setFriends(data.friends);
        addLog(`✅ Loaded ${data.friends.length} friends`, 'success');
      } else {
        addLog(`❌ Failed to load friends: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error loading friends: ${error.message}`, 'error');
    }
  };

  const selectFriend = async (friend) => {
    setSelectedFriend(friend);
    addLog(`👤 Selected friend: ${friend.user.username}`, 'info');
    
    try {
      const response = await fetch('/api/dm-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: friend.user.id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setChannelId(data.channel_id);
        addLog(`📨 DM channel loaded: ${data.channel_id}`, 'success');
      } else {
        addLog(`❌ Failed to get DM channel: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error getting DM channel: ${error.message}`, 'error');
    }
  };

  const startDeletion = async (customMessage = '', cooldownTime = 8) => {
    if (!channelId.trim()) {
      addLog('❌ Please enter a channel ID or select a friend', 'error');
      return;
    }

    setIsRunning(true);
    addLog('🚀 Starting DiscordMSG deletion protocol...', 'info');
    
    try {
      const response = await fetch('/api/start-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: channelId,
          time_range: selectedTimeRange,
          custom_message: customMessage,
          cooldown_time: cooldownTime
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog('✅ Deletion protocol started', 'success');
        startLogPolling();
      } else {
        addLog(`❌ Failed to start: ${data.error}`, 'error');
        setIsRunning(false);
      }
    } catch (error) {
      addLog(`❌ Error starting deletion: ${error.message}`, 'error');
      setIsRunning(false);
    }
  };

  const stopDeletion = async () => {
    try {
      const response = await fetch('/api/stop-deletion', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        addLog('🛑 Deletion protocol stopped', 'warning');
      }
    } catch (error) {
      addLog(`❌ Error stopping deletion: ${error.message}`, 'error');
    }
    
    setIsRunning(false);
  };

  const startLogPolling = () => {
    const poll = async () => {
      if (!isRunning) return;
      
      try {
        const response = await fetch('/api/logs');
        const data = await response.json();
        
        if (data.logs) {
          const newLogs = data.logs.filter(log => 
            !logs.find(existingLog => existingLog.id === log.id)
          );
          
          newLogs.forEach(log => {
            addLog(log.message, log.type, log.timestamp);
          });
        }
        
        if (data.completed) {
          setIsRunning(false);
        } else if (isRunning) {
          setTimeout(poll, 1000);
        }
      } catch (error) {
        console.error('Log polling error:', error);
        if (isRunning) {
          setTimeout(poll, 2000);
        }
      }
    };
    
    poll();
  };

  const addLog = (message, type = 'info', timestamp = null) => {
    const time = timestamp || new Date().toLocaleTimeString();
    const newLog = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: time
    };
    
    setLogs(prevLogs => [...prevLogs.slice(-49), newLog]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('📝 Log cleared', 'info');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <animated.div style={appSpring} className="app">
      <ParticleBackground />
      
      <motion.div 
        className="app-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Sidebar
          friends={friends}
          selectedFriend={selectedFriend}
          onSelectFriend={selectFriend}
          onRefreshFriends={loadFriends}
        />
        
        <MainContent
          channelId={channelId}
          setChannelId={setChannelId}
          selectedTimeRange={selectedTimeRange}
          setSelectedTimeRange={setSelectedTimeRange}
          isRunning={isRunning}
          onStart={startDeletion}
          onStop={stopDeletion}
          logs={logs}
          onClearLogs={clearLogs}
        />
      </motion.div>
    </animated.div>
  );
};

export default App;