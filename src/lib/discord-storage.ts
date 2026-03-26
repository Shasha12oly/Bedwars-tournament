// Discord Bot Storage System - Using Discord channels as JSON file storage
import { NextResponse } from 'next/server';

// Discord bot configuration from environment variables
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_STORAGE_CHANNEL_ID = process.env.DISCORD_STORAGE_CHANNEL_ID || process.env.DISCORD_CHANNEL_ID;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

// Discord API endpoints
const DISCORD_API_BASE = 'https://discord.com/api/v10';

// Interface for Discord message storage
interface DiscordMessage {
  id: string;
  content: string;
  timestamp: string;
  author: {
    id: string;
    username: string;
  };
}

// Storage message identifiers
const TEAMS_MESSAGE_ID = 'TEAMS_DATA';
const TOURNAMENTS_MESSAGE_ID = 'TOURNAMENTS_DATA';
const MATCHES_MESSAGE_ID = 'MATCHES_DATA';

// Discord API headers
function getDiscordHeaders() {
  return {
    'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'BedWarsTournamentBot/1.0'
  };
}

// Verify Discord bot configuration
export function verifyDiscordConfig() {
  if (!DISCORD_BOT_TOKEN) {
    throw new Error('DISCORD_BOT_TOKEN environment variable is required');
  }
  if (!DISCORD_STORAGE_CHANNEL_ID) {
    throw new Error('DISCORD_STORAGE_CHANNEL_ID environment variable is required');
  }
}

// Read data from Discord channel message
export async function readFromDiscord(messageIdentifier: string): Promise<any[]> {
  verifyDiscordConfig();
  
  try {
    // Get channel messages
    const response = await fetch(
      `${DISCORD_API_BASE}/channels/${DISCORD_STORAGE_CHANNEL_ID}/messages?limit=100`,
      {
        headers: getDiscordHeaders(),
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
    }

    const messages: DiscordMessage[] = await response.json();
    
    // Find message with matching identifier
    const storageMessage = messages.find(msg => 
      msg.content.startsWith(`**${messageIdentifier}**`)
    );

    if (!storageMessage) {
      console.log(`No storage message found for ${messageIdentifier}, returning empty array`);
      return [];
    }

    // Extract JSON data from message content
    const jsonMatch = storageMessage.content.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      console.error(`Invalid JSON format in Discord message for ${messageIdentifier}`);
      return [];
    }

    try {
      return JSON.parse(jsonMatch[1]);
    } catch (parseError) {
      console.error(`Failed to parse JSON from Discord message for ${messageIdentifier}:`, parseError);
      return [];
    }

  } catch (error) {
    console.error(`Error reading from Discord for ${messageIdentifier}:`, error);
    return [];
  }
}

// Write data to Discord channel message
export async function writeToDiscord(messageIdentifier: string, data: any[]): Promise<boolean> {
  verifyDiscordConfig();
  
  try {
    // Get existing messages to find or create storage message
    const getResponse = await fetch(
      `${DISCORD_API_BASE}/channels/${DISCORD_STORAGE_CHANNEL_ID}/messages?limit=100`,
      {
        headers: getDiscordHeaders(),
        cache: 'no-store'
      }
    );

    if (!getResponse.ok) {
      throw new Error(`Discord API error: ${getResponse.status} ${getResponse.statusText}`);
    }

    const messages: DiscordMessage[] = await getResponse.json();
    
    // Format message content with JSON data
    const jsonData = JSON.stringify(data, null, 2);
    const timestamp = new Date().toISOString();
    const messageContent = `**${messageIdentifier}**\n\`\`\`json\n${jsonData}\n\`\`\`\n*Last updated: ${timestamp}*`;
    
    const existingMessage = messages.find(msg => 
      msg.content.startsWith(`**${messageIdentifier}**`)
    );

    let response;

    if (existingMessage) {
      // Update existing message
      response = await fetch(
        `${DISCORD_API_BASE}/channels/${DISCORD_STORAGE_CHANNEL_ID}/messages/${existingMessage.id}`,
        {
          method: 'PATCH',
          headers: getDiscordHeaders(),
          body: JSON.stringify({
            content: messageContent
          })
        }
      );
    } else {
      // Create new message
      response = await fetch(
        `${DISCORD_API_BASE}/channels/${DISCORD_STORAGE_CHANNEL_ID}/messages`,
        {
          method: 'POST',
          headers: getDiscordHeaders(),
          body: JSON.stringify({
            content: messageContent
          })
        }
      );
    }

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
    }

    console.log(`Successfully saved ${messageIdentifier} to Discord`);
    return true;

  } catch (error) {
    console.error(`Error writing to Discord for ${messageIdentifier}:`, error);
    return false;
  }
}

// Teams storage functions
export async function getTeamsFromDiscord() {
  return await readFromDiscord(TEAMS_MESSAGE_ID);
}

export async function saveTeamsToDiscord(teams: any[]): Promise<boolean> {
  return await writeToDiscord(TEAMS_MESSAGE_ID, teams);
}

// Tournaments storage functions
export async function getTournamentsFromDiscord() {
  const tournaments = await readFromDiscord(TOURNAMENTS_MESSAGE_ID);
  
  // Return default tournament if no data exists
  if (tournaments.length === 0) {
    return [
      {
        id: '1',
        name: 'Blood Rush BedWars',
        date: 'March 29, 2026',
        time: '2:00 PM - 9:00 PM',
        status: 'upcoming',
        format: 'rbw 4v4',
        maxSlots: 16,
        currentTeams: 0,
        prizePool: '₹2000',
        rules: [
          'No cheating, hacking, or exploiting bugs',
          'Respect all players and staff',
          'Be on time for matches',
          'Follow Discord server rules',
          'Admin decisions are final'
        ],
        schedule: [
          { time: '2:00 PM', event: 'Registration closes' },
          { time: '2:15 PM', event: 'Tournament begins' },
          { time: '2:30 PM', event: 'Round of 16 starts' },
          { time: '4:15 PM', event: 'Quarterfinals' },
          { time: '6:30 PM', event: 'Semifinals' },
          { time: '8:30 PM', event: 'Finals' },
          { time: '9:00 PM', event: 'Awards ceremony' }
        ]
      }
    ];
  }
  
  return tournaments;
}

export async function saveTournamentsToDiscord(tournaments: any[]): Promise<boolean> {
  return await writeToDiscord(TOURNAMENTS_MESSAGE_ID, tournaments);
}

// Matches storage functions
export async function getMatchesFromDiscord() {
  return await readFromDiscord(MATCHES_MESSAGE_ID);
}

export async function saveMatchesToDiscord(matches: any[]): Promise<boolean> {
  return await writeToDiscord(MATCHES_MESSAGE_ID, matches);
}

// Get team count for a tournament
export async function getTeamCountFromDiscord(tournamentId: string): Promise<number> {
  const teams = await getTeamsFromDiscord();
  return teams.filter((team: any) => team.tournamentId === tournamentId).length;
}

// Test Discord connection
export async function testDiscordConnection(): Promise<boolean> {
  try {
    verifyDiscordConfig();
    
    const response = await fetch(
      `${DISCORD_API_BASE}/users/@me`,
      {
        headers: getDiscordHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
    }

    const botUser = await response.json();
    console.log('Discord bot connected successfully:', botUser.username);
    return true;

  } catch (error) {
    console.error('Discord connection test failed:', error);
    return false;
  }
}

// Initialize Discord storage (create initial messages if needed)
export async function initializeDiscordStorage(): Promise<boolean> {
  try {
    // Test connection first
    const connected = await testDiscordConnection();
    if (!connected) {
      return false;
    }

    // Check if storage messages exist, create if not
    const teams = await getTeamsFromDiscord();
    if (teams.length === 0) {
      await saveTeamsToDiscord([]);
    }

    const tournaments = await getTournamentsFromDiscord();
    if (tournaments.length === 0) {
      await saveTournamentsToDiscord([]);
    }

    const matches = await getMatchesFromDiscord();
    if (matches.length === 0) {
      await saveMatchesToDiscord([]);
    }

    console.log('Discord storage initialized successfully');
    return true;

  } catch (error) {
    console.error('Failed to initialize Discord storage:', error);
    return false;
  }
}
