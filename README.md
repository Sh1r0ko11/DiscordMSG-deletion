# DiscordMSG Deletion Tool

A modern, ultra-sleek Discord message deletion tool with a beautiful React-based UI. This application allows you to efficiently delete your own messages from Discord channels and DMs with customizable options.

![DiscordMSG Deletion Tool](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8+-green.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- **🎨 Modern UI**: Beautiful, responsive interface built with React and Framer Motion
- **⚡ Fast Performance**: Efficient message deletion with rate limiting
- **🎯 Precise Targeting**: Delete messages by time range (30m, 1h, 2h, 6h, 12h, 24h, 48h, or All)
- **💬 Custom Messages**: Send custom messages before deletion starts
- **⏱️ Configurable Cooldown**: Set custom cooldown time (1-60 seconds)
- **👥 Friends Integration**: Easy friend selection and DM channel detection
- **📊 Live Monitoring**: Real-time activity logs and progress tracking
- **🔒 Safe & Secure**: Only deletes YOUR messages, never others'
- **🖥️ Desktop App**: Runs as a standalone desktop application

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Discord User Token** - [How to get your token](https://github.com/Tyrrrz/DiscordChatExporter/wiki/Obtaining-Token-and-Channel-IDs)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/discordmsg-deletion-tool.git
   cd discordmsg-deletion-tool
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Build the React application**
   ```bash
   npm run build
   ```

5. **Configure your Discord token**
   - Open `app.py`
   - Replace `TOKEN = "your_token_here"` with your actual Discord token

6. **Run the application**
   ```bash
   python app.py
   ```

## 🛠️ Configuration

### Discord Token Setup

1. Open Discord in your browser
2. Press `F12` to open Developer Tools
3. Go to the `Network` tab
4. Send a message in any channel
5. Look for a request to `messages` and check the `Authorization` header
6. Copy the token and paste it in `app.py`

⚠️ **Security Warning**: Never share your Discord token publicly!

### Environment Variables (Recommended)

Create a `.env` file:
```env
DISCORD_TOKEN=your_discord_token_here
```

Then modify `app.py`:
```python
import os
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')
```

## 📖 Usage

1. **Launch the application** - Run `python app.py`
2. **Select target** - Choose a friend from the sidebar or enter a channel ID
3. **Set time range** - Choose how far back to delete messages
4. **Custom message** (Optional) - Enter a message to send before deletion
5. **Set cooldown** - Configure the countdown time (1-60 seconds)
6. **Start deletion** - Click "Initialize DiscordMSG Protocol"

### Time Range Options

- **30m** - Last 30 minutes
- **1h** - Last 1 hour
- **2h** - Last 2 hours
- **6h** - Last 6 hours
- **12h** - Last 12 hours
- **24h** - Last 24 hours
- **48h** - Last 48 hours
- **All** - All your messages (requires confirmation)

## 🏗️ Development

### Project Structure

```
discordmsg-deletion-tool/
├── app.py                 # Main Python application
├── requirements.txt       # Python dependencies
├── package.json          # Node.js dependencies
├── webpack.config.js     # Webpack configuration
├── src/                  # React source code
│   ├── App.jsx          # Main React component
│   ├── components/      # React components
│   ├── styles/          # CSS styles
│   └── index.html       # HTML template
├── templates/           # Generated templates
├── static/             # Static assets
└── README.md           # This file
```

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run Python application
python app.py

# Install new dependencies
pip install package_name
npm install package_name
```

### Building from Source

1. **Clone and setup**
   ```bash
   git clone https://github.com/yourusername/discordmsg-deletion-tool.git
   cd discordmsg-deletion-tool
   ```

2. **Install all dependencies**
   ```bash
   pip install -r requirements.txt
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Run in development mode**
   ```bash
   npm run dev  # In one terminal
   python app.py  # In another terminal
   ```

## 🔧 Troubleshooting

### Common Issues

**"Module not found" errors**
```bash
pip install -r requirements.txt
npm install
```

**Build failures**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Port already in use**
- Close other applications using port 5000
- Or modify the port in `app.py`

**Discord API errors**
- Verify your token is correct and not expired
- Check Discord's rate limits
- Ensure you have permission to access the channel

### Getting Help

1. Check the [Installation Guide](INSTALLATION_GUIDE.txt)
2. Review the console output for error messages
3. Ensure all dependencies are installed correctly
4. Verify your Discord token is valid

## ⚠️ Important Notes

- **Rate Limiting**: The tool respects Discord's rate limits (5 deletions per second)
- **Your Messages Only**: Only deletes messages sent by your account
- **No Undo**: Deleted messages cannot be recovered
- **Terms of Service**: Use responsibly and in accordance with Discord's ToS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, Flask, and modern web technologies
- UI animations powered by Framer Motion
- Icons provided by Lucide React

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Installation Guide](INSTALLATION_GUIDE.txt)
2. Review existing [Issues](https://github.com/yourusername/discordmsg-deletion-tool/issues)
3. Create a new issue with detailed information

---

**⚠️ Disclaimer**: This tool is for educational purposes. Use responsibly and in accordance with Discord's Terms of Service. The developers are not responsible for any misuse of this software.