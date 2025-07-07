// DiscordMSG Deletion Tool - Modern Web Interface
class Ex01App {
    constructor() {
        this.friends = [];
        this.filteredFriends = [];
        this.selectedFriend = null;
        this.selectedTimeRange = '30m';
        this.isRunning = false;
        this.logEntries = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFriends();
        this.updateUI();
        this.startAnimations();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('friendSearch');
        const searchClear = document.getElementById('searchClear');
        
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        searchClear.addEventListener('click', () => this.clearSearch());

        // Time range selection
        document.querySelectorAll('.time-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectTimeRange(e.target.dataset.value));
        });

        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startDeletion());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopDeletion());
        document.getElementById('refreshFriends').addEventListener('click', () => this.loadFriends());

        // Utility buttons
        document.getElementById('pasteBtn').addEventListener('click', () => this.pasteChannelId());
        document.getElementById('clearLog').addEventListener('click', () => this.clearLog());
        document.getElementById('exportLog').addEventListener('click', () => this.exportLog());

        // Modal events
        document.getElementById('modalClose').addEventListener('click', () => this.hideModal());
        document.getElementById('modalCancel').addEventListener('click', () => this.hideModal());
        document.getElementById('modalConfirm').addEventListener('click', () => this.confirmAction());

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    async loadFriends() {
        this.log('🔄 Loading friends list...', 'info');
        
        try {
            const response = await fetch('/api/friends');
            const data = await response.json();
            
            if (data.success) {
                this.friends = data.friends;
                this.filteredFriends = [...this.friends];
                this.updateFriendsList();
                this.updateFriendsCount();
                this.log(`✅ Loaded ${this.friends.length} friends`, 'success');
            } else {
                this.log(`❌ Failed to load friends: ${data.error}`, 'error');
            }
        } catch (error) {
            this.log(`❌ Error loading friends: ${error.message}`, 'error');
        }
    }

    handleSearch(query) {
        const searchClear = document.getElementById('searchClear');
        
        if (query.trim()) {
            searchClear.classList.add('visible');
            this.filteredFriends = this.friends.filter(friend => 
                friend.user.username.toLowerCase().includes(query.toLowerCase())
            );
        } else {
            searchClear.classList.remove('visible');
            this.filteredFriends = [...this.friends];
        }
        
        this.updateFriendsList();
        this.updateFriendsCount();
    }

    clearSearch() {
        const searchInput = document.getElementById('friendSearch');
        const searchClear = document.getElementById('searchClear');
        
        searchInput.value = '';
        searchClear.classList.remove('visible');
        this.filteredFriends = [...this.friends];
        this.updateFriendsList();
        this.updateFriendsCount();
    }

    updateFriendsList() {
        const friendsList = document.getElementById('friendsList');
        
        if (this.filteredFriends.length === 0) {
            friendsList.innerHTML = `
                <div class="loading-friends">
                    <i class="fas fa-user-slash"></i>
                    <span>No friends found</span>
                </div>
            `;
            return;
        }

        friendsList.innerHTML = this.filteredFriends.map(friend => `
            <div class="friend-item ${this.selectedFriend?.user.id === friend.user.id ? 'selected' : ''}" 
                 data-friend-id="${friend.user.id}">
                <div class="friend-avatar">
                    <i class="fas fa-user"></i>
                    <div class="friend-status ${this.getStatusClass(friend.user.status)}"></div>
                </div>
                <div class="friend-info">
                    <div class="friend-name">${this.escapeHtml(friend.user.username)}</div>
                    <div class="friend-id">ID: ${friend.user.id}</div>
                </div>
            </div>
        `).join('');

        // Add click events to friend items
        friendsList.querySelectorAll('.friend-item').forEach(item => {
            item.addEventListener('click', () => {
                const friendId = item.dataset.friendId;
                this.selectFriend(friendId);
            });
        });
    }

    selectFriend(friendId) {
        this.selectedFriend = this.friends.find(f => f.user.id === friendId);
        
        if (this.selectedFriend) {
            this.updateFriendsList();
            this.getDMChannel(friendId);
            this.log(`👤 Selected friend: ${this.selectedFriend.user.username}`, 'info');
        }
    }

    async getDMChannel(userId) {
        try {
            const response = await fetch('/api/dm-channel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('channelId').value = data.channel_id;
                this.log(`📨 DM channel loaded: ${data.channel_id}`, 'success');
            } else {
                this.log(`❌ Failed to get DM channel: ${data.error}`, 'error');
            }
        } catch (error) {
            this.log(`❌ Error getting DM channel: ${error.message}`, 'error');
        }
    }

    selectTimeRange(value) {
        this.selectedTimeRange = value;
        
        document.querySelectorAll('.time-option').forEach(option => {
            option.classList.remove('active');
        });
        
        document.querySelector(`[data-value="${value}"]`).classList.add('active');
        
        this.log(`⏰ Time range selected: ${value}`, 'info');
    }

    async startDeletion() {
        const channelId = document.getElementById('channelId').value.trim();
        
        if (!channelId) {
            this.showModal('Error', 'Please enter a channel ID or select a friend.');
            return;
        }

        if (this.selectedTimeRange === 'All') {
            this.showModal(
                'Confirm Deletion', 
                'You are about to delete ALL your messages in this channel. This action cannot be undone. Are you sure?',
                () => this.executeStart(channelId)
            );
        } else {
            this.executeStart(channelId);
        }
    }

    async executeStart(channelId) {
        this.isRunning = true;
        this.updateControlButtons();
        this.updateStatus('active', 'Protocol Active');
        
        this.log('🚀 Starting Ex01 deletion protocol...', 'info');
        
        try {
            const response = await fetch('/api/start-deletion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channel_id: channelId,
                    time_range: this.selectedTimeRange
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.log('✅ Deletion protocol started', 'success');
                this.startLogPolling();
            } else {
                this.log(`❌ Failed to start: ${data.error}`, 'error');
                this.isRunning = false;
                this.updateControlButtons();
                this.updateStatus('ready', 'System Ready');
            }
        } catch (error) {
            this.log(`❌ Error starting deletion: ${error.message}`, 'error');
            this.isRunning = false;
            this.updateControlButtons();
            this.updateStatus('ready', 'System Ready');
        }
    }

    async stopDeletion() {
        try {
            const response = await fetch('/api/stop-deletion', { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                this.log('🛑 Deletion protocol stopped', 'warning');
            }
        } catch (error) {
            this.log(`❌ Error stopping deletion: ${error.message}`, 'error');
        }
        
        this.isRunning = false;
        this.updateControlButtons();
        this.updateStatus('ready', 'System Ready');
    }

    startLogPolling() {
        if (!this.isRunning) return;
        
        fetch('/api/logs')
            .then(response => response.json())
            .then(data => {
                if (data.logs) {
                    data.logs.forEach(logEntry => {
                        if (!this.logEntries.find(entry => entry.id === logEntry.id)) {
                            this.logEntries.push(logEntry);
                            this.addLogEntry(logEntry.message, logEntry.type, logEntry.timestamp);
                        }
                    });
                }
                
                if (data.completed) {
                    this.isRunning = false;
                    this.updateControlButtons();
                    this.updateStatus('ready', 'System Ready');
                } else if (this.isRunning) {
                    setTimeout(() => this.startLogPolling(), 1000);
                }
            })
            .catch(error => {
                console.error('Log polling error:', error);
                if (this.isRunning) {
                    setTimeout(() => this.startLogPolling(), 2000);
                }
            });
    }

    updateControlButtons() {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        startBtn.disabled = this.isRunning;
        stopBtn.disabled = !this.isRunning;
        
        if (this.isRunning) {
            startBtn.classList.add('glow');
        } else {
            startBtn.classList.remove('glow');
        }
    }

    updateStatus(type, message) {
        const statusIcon = document.querySelector('.status-icon');
        const statusText = document.getElementById('statusText');
        
        statusIcon.className = `status-icon ${type}`;
        statusText.textContent = message;
        
        const statusItem = document.querySelector('.status-item');
        statusItem.style.borderLeftColor = type === 'active' ? 'var(--danger)' : 
                                          type === 'warning' ? 'var(--warning)' : 'var(--success)';
    }

    updateFriendsCount() {
        const count = this.filteredFriends.length;
        const total = this.friends.length;
        const countElement = document.getElementById('friendsCount');
        
        if (count === total) {
            countElement.textContent = total;
        } else {
            countElement.textContent = `${count}/${total}`;
        }
    }

    log(message, type = 'info') {
        this.addLogEntry(message, type);
    }

    addLogEntry(message, type = 'info', timestamp = null) {
        const logContent = document.getElementById('logContent');
        const time = timestamp || new Date().toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type} fade-in`;
        logEntry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-message">${this.escapeHtml(message)}</span>
        `;
        
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
        
        // Remove fade-in class after animation
        setTimeout(() => logEntry.classList.remove('fade-in'), 500);
    }

    clearLog() {
        const logContent = document.getElementById('logContent');
        logContent.innerHTML = '';
        this.logEntries = [];
        this.log('📝 Log cleared', 'info');
    }

    exportLog() {
        const logs = this.logEntries.map(entry => 
            `[${entry.timestamp}] ${entry.message}`
        ).join('\n');
        
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ex01-log-${new Date().toISOString().slice(0, 19)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.log('📥 Log exported', 'success');
    }

    async pasteChannelId() {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('channelId').value = text;
            this.log('📋 Channel ID pasted from clipboard', 'success');
        } catch (error) {
            this.log('❌ Failed to paste from clipboard', 'error');
        }
    }

    showModal(title, message, confirmCallback = null) {
        const modal = document.getElementById('confirmModal');
        const modalTitle = modal.querySelector('.modal-header h3');
        const modalMessage = document.getElementById('confirmMessage');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.add('visible');
        
        this.modalConfirmCallback = confirmCallback;
    }

    hideModal() {
        const modal = document.getElementById('confirmModal');
        modal.classList.remove('visible');
        this.modalConfirmCallback = null;
    }

    confirmAction() {
        if (this.modalConfirmCallback) {
            this.modalConfirmCallback();
        }
        this.hideModal();
    }

    toggleTheme() {
        // Theme toggle functionality can be implemented here
        this.log('🎨 Theme toggle clicked', 'info');
    }

    handleKeyboard(e) {
        // Keyboard shortcuts
        if (e.ctrlKey) {
            switch (e.key) {
                case 'r':
                    e.preventDefault();
                    this.loadFriends();
                    break;
                case 'l':
                    e.preventDefault();
                    this.clearLog();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (!this.isRunning) {
                        this.startDeletion();
                    }
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            this.hideModal();
        }
    }

    startAnimations() {
        // Add entrance animations
        document.querySelectorAll('.config-panel, .control-panel, .activity-panel').forEach((panel, index) => {
            panel.style.animationDelay = `${index * 0.1}s`;
            panel.classList.add('fade-in');
        });
        
        // Animate sidebar
        document.querySelector('.sidebar').classList.add('slide-in');
    }

    updateUI() {
        this.updateControlButtons();
        this.updateStatus('ready', 'System Ready');
        this.updateFriendsCount();
    }

    getStatusClass(status) {
        switch (status) {
            case 'online': return 'online';
            case 'idle': return 'idle';
            case 'dnd': return 'idle';
            default: return 'offline';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ex01App = new Ex01App();
});

// Add some global utility functions
window.addEventListener('beforeunload', (e) => {
    if (window.ex01App && window.ex01App.isRunning) {
        e.preventDefault();
        e.returnValue = 'Deletion is in progress. Are you sure you want to leave?';
    }
});

// Add smooth scrolling for better UX
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// loading 
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const promise = originalFetch.apply(this, args);
    
    // Add loading indicator logic here if needed or just leave it blank yeah...
    
    return promise;
};