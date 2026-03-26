# Discord Storage Setup Guide

## Overview
Your BedWars tournament platform now uses Discord channels as JSON file storage through a Discord bot. This provides persistent, cloud-based storage that's accessible from anywhere.

## Required Environment Variables

Add these to your `.env.local` file and Render deployment:

```bash
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_STORAGE_CHANNEL_ID=your_storage_channel_id_here
DISCORD_GUILD_ID=your_server_id_here

# Optional (for notifications)
DISCORD_CHANNEL_ID=your_announcements_channel_id_here
DISCORD_RULES_CHANNEL_ID=your_rules_channel_id_here
DISCORD_HOST_ROLE_ID=your_host_role_id_here
DISCORD_PING_EVERYONE=true
```

## Setup Instructions

### 1. Create Discord Bot
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application → Bot
3. Copy the **Bot Token**
4. Enable **Message Content Intent** in bot settings
5. Invite bot to your server with these permissions:
   - Read Messages/View Channels
   - Send Messages
   - Embed Links
   - Read Message History

### 2. Create Storage Channel
1. Create a dedicated channel (e.g., `#tournament-data-storage`)
2. Make it private or restrict access
3. Copy the **Channel ID** (right-click channel → Copy Channel ID)
4. Add this ID to `DISCORD_STORAGE_CHANNEL_ID`

### 3. Get Server ID
1. Right-click your server icon
2. Copy **Server ID** (enable Developer Mode in Discord settings)
3. Add this to `DISCORD_GUILD_ID`

## How It Works

### Storage Format
The bot stores JSON data in Discord messages with this format:

```
**TEAMS_DATA**
```json
[
  {
    "id": "team-123",
    "name": "Team Name",
    "captain": "Player1",
    "members": ["Player1", "Player2", "Player3", "Player4"],
    "discord": "user123#4567",
    "tournamentId": "1",
    "registeredAt": "2026-03-26T12:00:00.000Z",
    "status": "registered"
  }
]
```
*Last updated: 2026-03-26T12:00:00.000Z*
```

### Data Types Stored
- **TEAMS_DATA**: All team registrations
- **TOURNAMENTS_DATA**: Tournament configurations  
- **MATCHES_DATA**: Tournament bracket and match results

### Fallback System
- **Primary**: Discord channel storage
- **Fallback**: Browser LocalStorage (if Discord is unavailable)
- **Backup**: Both systems maintain同步 (sync)

## API Endpoints

### Test Discord Storage
```bash
GET /api/discord-storage
```
Tests connection and shows data counts.

### Initialize Storage
```bash
POST /api/discord-storage
```
Creates initial storage messages if needed.

### Check Storage Status
```bash
GET /api/storage-status
```
Shows which storage system is active (Discord/LocalStorage).

## Benefits

✅ **Cloud-based storage** - No server files needed
✅ **Persistent** - Data survives deployments/restarts
✅ **Accessible** - View/edit data directly in Discord
✅ **Backup** - Automatic LocalStorage fallback
✅ **Real-time** - Instant updates across all users
✅ **Secure** - Private channel storage

## Usage Examples

### Team Registration
When a team registers, the data is:
1. Saved to Discord channel message
2. Backed up to LocalStorage
3. Available immediately to all users

### Admin Management
- View raw JSON data in Discord channel
- Edit manually if needed (with caution)
- Automatic sync with web interface

### Data Recovery
- Export data from Discord messages
- Import to new deployments
- Version history in message edits

## Troubleshooting

### Common Issues
1. **Bot Token Invalid**: Check token in Discord Developer Portal
2. **Missing Permissions**: Ensure bot has message permissions
3. **Channel ID Wrong**: Right-click channel to copy correct ID
4. **Rate Limits**: Discord has API rate limits (handled automatically)

### Error Messages
- `"DISCORD_BOT_TOKEN environment variable is required"` → Add bot token
- `"Discord API error: 403 Forbidden"` → Fix bot permissions
- `"No storage message found"` → Initialize storage with POST /api/discord-storage

## Migration from Local Files

Your existing `data/teams.json` and `data/tournaments.json` files will still work as fallbacks. To migrate:

1. Set up Discord bot and channel
2. Visit `/api/discord-storage` to initialize
3. Register a test team to verify Discord storage
4. Data will automatically use Discord going forward

## Security Notes

- Keep bot token secret (environment variable)
- Use private storage channel
- Regularly check bot permissions
- Monitor Discord API usage limits
