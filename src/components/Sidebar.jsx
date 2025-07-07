import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, RefreshCw, Zap, Circle } from 'lucide-react';

const Sidebar = ({ friends, selectedFriend, onSelectFriend, onRefreshFriends }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    return friends.filter(friend =>
      friend.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshFriends();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#43b581';
      case 'idle': return '#faa61a';
      case 'dnd': return '#f04747';
      default: return '#747f8d';
    }
  };

  return (
    <motion.div 
      className="sidebar"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div 
        className="sidebar-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="logo">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Zap size={28} />
          </motion.div>
          <span>Ex01 Tool</span>
        </div>
        
        <motion.div 
          className="status-indicator"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="status-dot"
            animate={{ 
              boxShadow: [
                '0 0 0 0 rgba(67, 181, 129, 0.7)',
                '0 0 0 8px rgba(67, 181, 129, 0)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>Online</span>
        </motion.div>
      </motion.div>

      {/* Friends Section */}
      <motion.div 
        className="friends-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="section-header">
          <Users size={16} />
          <span>Friends</span>
          <motion.span 
            className="friends-count"
            key={filteredFriends.length}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {searchQuery ? `${filteredFriends.length}/${friends.length}` : friends.length}
          </motion.span>
        </div>

        {/* Search */}
        <motion.div 
          className="search-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Friends List */}
        <motion.div 
          className="friends-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {filteredFriends.length === 0 ? (
              <motion.div
                className="no-friends"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Users size={32} />
                <span>No friends found</span>
              </motion.div>
            ) : (
              <motion.div
                key="friends-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredFriends.map((friend, index) => (
                  <motion.div
                    key={friend.user.id}
                    className={`friend-item ${selectedFriend?.user.id === friend.user.id ? 'selected' : ''}`}
                    onClick={() => onSelectFriend(friend)}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ 
                      delay: 0.6 + index * 0.05,
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      x: 8,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="friend-avatar">
                      <div className="avatar-placeholder">
                        {friend.user.username.charAt(0).toUpperCase()}
                      </div>
                      <motion.div
                        className="friend-status"
                        style={{ backgroundColor: getStatusColor(friend.user.status) }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.05, type: "spring" }}
                      />
                    </div>
                    
                    <div className="friend-info">
                      <div className="friend-name">{friend.user.username}</div>
                      <div className="friend-id">ID: {friend.user.id}</div>
                    </div>

                    <motion.div
                      className="selection-indicator"
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: selectedFriend?.user.id === friend.user.id ? 1 : 0 
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Circle size={8} fill="currentColor" />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Refresh Button */}
        <motion.button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 8px 25px rgba(88, 101, 242, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ 
              duration: 1,
              repeat: isRefreshing ? Infinity : 0,
              ease: "linear"
            }}
          >
            <RefreshCw size={16} />
          </motion.div>
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Friends'}</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;