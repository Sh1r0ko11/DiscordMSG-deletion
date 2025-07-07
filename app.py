import asyncio
import aiohttp
import webview
import threading
import json
import time
from datetime import datetime, timedelta, timezone
from flask import Flask, render_template, request, jsonify
import random
import uuid

# Discord Configuration
TOKEN = "Your_Discord_Account_Token"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36"

HEADERS = {
    "Authorization": TOKEN,
    "User-Agent": USER_AGENT,
}

PROFESSIONAL_ALERTS = [
    "Your devices and all data have been deliberately destroyed by **EX01**. This action was intentional to eliminate information that must **not** be disclosed. Your Discord account has been flagged and preserved for investigation. This process is irreversible.",
]

# Flask App
app = Flask(__name__)
app.config['SECRET_KEY'] = 'DiscordMSG Deletion-delete-tool-secret'

class Ex01DeleteTool:
    def __init__(self):
        self.friends_list = []
        self.purge_running = False
        self.countdown_running = False
        self.log_entries = []
        self.current_user_id = None
        
        # Async loop
        self.loop = asyncio.new_event_loop()
        self.loop_thread = threading.Thread(target=self.run_async_loop, daemon=True)
        self.loop_thread.start()
        
        # Load user info
        asyncio.run_coroutine_threadsafe(self.load_user_info(), self.loop)
    
    def run_async_loop(self):
        asyncio.set_event_loop(self.loop)
        self.loop.run_forever()
    
    async def load_user_info(self):
        """Load current user information"""
        try:
            async with aiohttp.ClientSession(headers=HEADERS) as session:
                async with session.get("https://discord.com/api/v9/users/@me") as resp:
                    if resp.status == 200:
                        user_data = await resp.json()
                        self.current_user_id = user_data.get('id')
                        self.log(f"🔍 Logged in as: {user_data.get('username')}#{user_data.get('discriminator')}", "success")
                    else:
                        self.log(f"❌ Failed to load user info: HTTP {resp.status}", "error")
        except Exception as e:
            self.log(f"❌ Error loading user info: {str(e)}", "error")
    
    async def fetch_friends(self):
        """Fetch friends list from Discord API"""
        try:
            async with aiohttp.ClientSession(headers=HEADERS) as session:
                async with session.get("https://discord.com/api/v9/users/@me/relationships") as resp:
                    if resp.status == 200:
                        relationships = await resp.json()
                        self.friends_list = [r for r in relationships if r.get('type') == 1]  # Type 1 = friend
                        self.log(f"✅ Loaded {len(self.friends_list)} friends", "success")
                        return True
                    else:
                        self.log(f"❌ Failed to load friends: HTTP {resp.status}", "error")
                        return False
        except Exception as e:
            self.log(f"❌ Error loading friends: {str(e)}", "error")
            return False
    
    async def get_dm_channel(self, user_id):
        """Get DM channel ID for a user"""
        try:
            async with aiohttp.ClientSession(headers=HEADERS) as session:
                dm_data = {"recipient_id": user_id}
                async with session.post("https://discord.com/api/v9/users/@me/channels", json=dm_data) as resp:
                    if resp.status == 200:
                        channel_data = await resp.json()
                        channel_id = channel_data.get('id')
                        self.log(f"📨 DM channel loaded: {channel_id}", "success")
                        return channel_id
                    else:
                        self.log(f"❌ Failed to get DM channel: HTTP {resp.status}", "error")
                        return None
        except Exception as e:
            self.log(f"❌ Error getting DM channel: {str(e)}", "error")
            return None
    
    async def execute_deletion_protocol(self, channel_id, time_range, custom_message="", cooldown_time=8):
        """Execute the deletion protocol"""
        async with aiohttp.ClientSession(headers=HEADERS) as session:
            # Send custom message or default professional alert
            if custom_message.strip():
                # Use custom message
                professional_msg = {
                    "content": f"{custom_message}\n\n*Automated cleanup initiating in {cooldown_time} seconds.*\n\n— DiscordMSG Deletion Tool"
                }
                self.log(f"📨 Sending custom message: {custom_message[:50]}{'...' if len(custom_message) > 50 else ''}", "info")
            else:
                # Use default alert
                alert_message = random.choice(PROFESSIONAL_ALERTS)
                professional_msg = {
                    "content": f"**NOTICE:** {alert_message}\n\n*Automated cleanup initiating in {cooldown_time} seconds.*\n\n— DiscordMSG Deletion Tool"
                }
            
            message_url = f"https://discord.com/api/v9/channels/{channel_id}/messages"
            
            try:
                async with session.post(message_url, json=professional_msg) as resp:
                    if resp.status == 200:
                        self.log("📨 Message sent successfully", "success")
                    else:
                        self.log(f"❌ Failed to send message: HTTP {resp.status}", "error")
            except Exception as e:
                self.log(f"❌ Error sending message: {str(e)}", "error")
                
            # Countdown with custom time
            for i in range(cooldown_time, 0, -1):
                if not self.countdown_running:
                    return
                self.log(f"⏳ DiscordMSG executing in {i}s...", "countdown")
                await asyncio.sleep(1)
                
            if not self.purge_running:
                return
                
            # Execute deletion
            await self.delete_messages(channel_id, time_range)
    
    async def delete_messages(self, channel_id, time_range):
        """Delete messages in the specified channel and time range"""
        async with aiohttp.ClientSession(headers=HEADERS) as session:
            # Calculate cutoff time - messages NEWER than this time will be deleted
            if time_range == "All":
                cutoff = None  # Delete all messages
                self.log("⏰ Deleting ALL messages from this user", "warning")
            else:
                # Make cutoff timezone-aware (UTC)
                cutoff = datetime.now(timezone.utc) - self.parse_time(time_range)
                self.log(f"⏰ Deleting messages newer than: {cutoff.strftime('%Y-%m-%d %H:%M:%S')} UTC", "info")
                
            url = f"https://discord.com/api/v9/channels/{channel_id}/messages"
            deleted = 0
            last_message_id = None
            
            self.log("🔥 Ex01 deletion protocol active", "info")
            
            while self.purge_running:
                # Build parameters for pagination
                params = {"limit": 100}
                if last_message_id:
                    params["before"] = last_message_id
                
                try:
                    async with session.get(url, params=params) as resp:
                        if resp.status != 200:
                            self.log(f"❌ Fetch error: HTTP {resp.status}", "error")
                            break
                            
                        messages = await resp.json()
                        if not messages:
                            self.log("📭 No more messages found", "info")
                            break
                        
                        # Update last message ID for pagination
                        last_message_id = messages[-1]["id"]
                        
                        # Filter messages: only own messages within time range
                        to_delete = []
                        found_older_messages = False
                        
                        for msg in messages:
                            # Check if message is from current user
                            if msg["author"]["id"] != self.current_user_id:
                                continue
                                
                            # Parse message timestamp (Discord timestamps are in UTC)
                            msg_time = datetime.fromisoformat(msg["timestamp"].replace("Z", "+00:00"))
                            
                            if cutoff is None:
                                # Delete all messages if "All" is selected
                                to_delete.append(msg)
                            elif msg_time >= cutoff:
                                # Message is within the time range - delete it
                                to_delete.append(msg)
                            else:
                                # Message is older than cutoff - stop here
                                found_older_messages = True
                                break
                        
                        if not to_delete:
                            if found_older_messages:
                                self.log("⏰ Reached messages older than time limit", "info")
                                break
                            else:
                                # Continue searching if no messages to delete in this batch
                                continue
                        
                        self.log(f"📋 Found {len(to_delete)} messages to delete in this batch", "info")
                        
                        # Delete messages
                        for msg in to_delete:
                            if not self.purge_running:
                                break
                                
                            del_url = f"{url}/{msg['id']}"
                            try:
                                async with session.delete(del_url) as del_resp:
                                    if del_resp.status == 204:
                                        # Show preview of deleted message
                                        msg_content = msg.get('content', '[No content]')
                                        msg_preview = msg_content[:50] + ('...' if len(msg_content) > 50 else '')
                                        msg_time_str = datetime.fromisoformat(msg["timestamp"].replace("Z", "+00:00")).strftime('%H:%M:%S')
                                        self.log(f"🗑️ [{msg_time_str}] Deleted: \"{msg_preview}\"", "success")
                                        deleted += 1
                                    elif del_resp.status == 404:
                                        self.log(f"⚠️ Message already deleted", "warning")
                                    else:
                                        self.log(f"❌ Delete failed: HTTP {del_resp.status}", "error")
                            except Exception as e:
                                self.log(f"❌ Delete error: {str(e)}", "error")
                                        
                            # Rate limiting - Discord allows ~5 deletions per second
                            await asyncio.sleep(0.25)
                        
                        # If we found older messages, stop processing
                        if found_older_messages:
                            self.log("⏰ Reached time limit, stopping deletion", "info")
                            break
                            
                except Exception as e:
                    self.log(f"❌ Protocol error: {str(e)}", "error")
                    break
                    
            self.log(f"✅ DiscordMSG  protocol completed: {deleted} messages deleted", "success")
            self.purge_running = False
            self.countdown_running = False
    
    def parse_time(self, time_str):
        """Parse time string and return timedelta object"""
        try:
            if time_str.endswith("m"):
                return timedelta(minutes=int(time_str[:-1]))
            elif time_str.endswith("h"):
                return timedelta(hours=int(time_str[:-1]))
            elif time_str.endswith("d"):
                return timedelta(days=int(time_str[:-1]))
            else:
                # Handle special cases like "48h"
                if time_str == "48h":
                    return timedelta(hours=48)
                elif time_str == "24h":
                    return timedelta(hours=24)
                else:
                    return timedelta(hours=1)
        except ValueError:
            self.log(f"⚠️ Invalid time format: {time_str}, using 1 hour default", "warning")
            return timedelta(hours=1)
    
    def log(self, message, log_type="info"):
        """Add log entry"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = {
            "id": str(uuid.uuid4()),
            "timestamp": timestamp,
            "message": message,
            "type": log_type
        }
        self.log_entries.append(log_entry)
        print(f"[{timestamp}] {message}")  # Also print to console
    
    def start_deletion(self, channel_id, time_range, custom_message="", cooldown_time=8):
        """Start the deletion process"""
        if self.purge_running:
            return False
            
        self.purge_running = True
        self.countdown_running = True
        
        # Start the deletion protocol
        coro = self.execute_deletion_protocol(channel_id, time_range, custom_message, cooldown_time)
        asyncio.run_coroutine_threadsafe(coro, self.loop)
        return True
    
    def stop_deletion(self):
        """Stop the deletion process"""
        self.purge_running = False
        self.countdown_running = False
        self.log("🛑 DiscordMSG protocol terminated", "error")

# Global instance
delete_tool = Ex01DeleteTool()

# Flask Routes
@app.route('/')
def index():
    return render_template('react_index.html')

@app.route('/old')
def old_index():
    return render_template('index.html')

@app.route('/api/friends')
def get_friends():
    """Get friends list"""
    async def fetch():
        success = await delete_tool.fetch_friends()
        return success
    
    future = asyncio.run_coroutine_threadsafe(fetch(), delete_tool.loop)
    success = future.result(timeout=10)
    
    if success:
        return jsonify({
            "success": True,
            "friends": delete_tool.friends_list
        })
    else:
        return jsonify({
            "success": False,
            "error": "Failed to fetch friends"
        })

@app.route('/api/dm-channel', methods=['POST'])
def get_dm_channel():
    """Get DM channel for a user"""
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"success": False, "error": "User ID required"})
    
    async def fetch():
        return await delete_tool.get_dm_channel(user_id)
    
    future = asyncio.run_coroutine_threadsafe(fetch(), delete_tool.loop)
    channel_id = future.result(timeout=10)
    
    if channel_id:
        return jsonify({
            "success": True,
            "channel_id": channel_id
        })
    else:
        return jsonify({
            "success": False,
            "error": "Failed to get DM channel"
        })

@app.route('/api/start-deletion', methods=['POST'])
def start_deletion():
    """Start deletion process"""
    data = request.get_json()
    channel_id = data.get('channel_id')
    time_range = data.get('time_range', '30m')
    custom_message = data.get('custom_message', '')
    cooldown_time = data.get('cooldown_time', 8)
    
    if not channel_id:
        return jsonify({"success": False, "error": "Channel ID required"})
    
    # Validate cooldown time
    try:
        cooldown_time = int(cooldown_time)
        if cooldown_time < 1 or cooldown_time > 60:
            cooldown_time = 8
    except (ValueError, TypeError):
        cooldown_time = 8
    
    success = delete_tool.start_deletion(channel_id, time_range, custom_message, cooldown_time)
    
    if success:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "error": "Deletion already in progress"})

@app.route('/api/stop-deletion', methods=['POST'])
def stop_deletion():
    """Stop deletion process"""
    delete_tool.stop_deletion()
    return jsonify({"success": True})

@app.route('/api/logs')
def get_logs():
    """Get log entries"""
    return jsonify({
        "logs": delete_tool.log_entries[-50:],  # Return last 50 entries
        "completed": not delete_tool.purge_running
    })

def create_window():
    """Create the webview window"""
    # Start Flask in a separate thread
    flask_thread = threading.Thread(target=lambda: app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False), daemon=True)
    flask_thread.start()
    
    # Wait a moment for Flask to start
    time.sleep(2)
    
    # Create webview window
    webview.create_window(
        'DiscordMSG Deletion Tool - Open Source Edition',
        'http://127.0.0.1:5000',
        width=1200,
        height=1300,
        min_size=(1000, 700),
        resizable=True,
        shadow=True,
        on_top=False,
        text_select=False
    )
    
    # Add initial log entry
    delete_tool.log("✅ DiscordMSG Deletion Tool initialized successfully", "success")
    
    webview.start(debug=False)

if __name__ == '__main__':
    create_window()