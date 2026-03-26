import { NextResponse } from 'next/server';
import { 
  getTeamsFromDiscord, 
  saveTeamsToDiscord, 
  getMatchesFromDiscord,
  saveMatchesToDiscord,
  testDiscordConnection 
} from '@/lib/discord-storage';

// API endpoint to test Discord connection and initialize storage
export async function GET() {
  try {
    const isConnected = await testDiscordConnection();
    
    if (isConnected) {
      // Try to read existing data
      const teams = await getTeamsFromDiscord();
      const matches = await getMatchesFromDiscord();
      
      return NextResponse.json({
        success: true,
        connected: true,
        data: {
          teams: teams.length,
          matches: matches.length
        },
        message: 'Discord storage is working correctly'
      });
    } else {
      return NextResponse.json({
        success: false,
        connected: false,
        message: 'Failed to connect to Discord bot'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Discord storage test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Discord storage test failed'
    }, { status: 500 });
  }
}

// API endpoint to initialize Discord storage with default data
export async function POST() {
  try {
    // Test connection first
    const isConnected = await testDiscordConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        message: 'Failed to connect to Discord bot'
      }, { status: 500 });
    }

    // Initialize with empty arrays if no data exists
    const teams = await getTeamsFromDiscord();
    const matches = await getMatchesFromDiscord();

    let teamsSaved = true;
    let matchesSaved = true;

    if (teams.length === 0) {
      teamsSaved = await saveTeamsToDiscord([]);
    }

    if (matches.length === 0) {
      matchesSaved = await saveMatchesToDiscord([]);
    }

    return NextResponse.json({
      success: teamsSaved && matchesSaved,
      message: 'Discord storage initialized successfully',
      data: {
        teams: teams.length,
        matches: matches.length,
        teamsSaved,
        matchesSaved
      }
    });

  } catch (error) {
    console.error('Failed to initialize Discord storage:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to initialize Discord storage'
    }, { status: 500 });
  }
}
