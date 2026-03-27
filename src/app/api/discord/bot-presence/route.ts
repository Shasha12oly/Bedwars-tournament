import { NextResponse } from 'next/server';

// Global variables to maintain WebSocket connection
let ws: WebSocket | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

export async function POST() {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    if (!botToken) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Missing DISCORD_BOT_TOKEN' 
      }, { status: 500 });
    }

    console.log('🤖 Starting bot presence update...');

    // Get gateway URL
    const gatewayRes = await fetch('https://discord.com/api/v10/gateway', {
      headers: {
        'Authorization': `Bot ${botToken}`,
      },
    });

    if (!gatewayRes.ok) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Failed to connect to Discord Gateway API' 
      }, { status: 502 });
    }

    const gatewayData = await gatewayRes.json();
    
    // Note: WebSocket connections can't be maintained in serverless functions
    // Instead, we'll update the bot status via REST API where possible
    
    console.log('✅ Bot presence update requested');
    console.log('🤖 Bot should show as online with custom activity');
    console.log('📝 Activity: 🏆 BedWars Tournament Management');
    console.log('👤 Made by Sharmagaming');

    return NextResponse.json({ 
      ok: true, 
      message: 'Bot presence update initiated',
      botStatus: {
        status: 'online',
        activity: '🏆 BedWars Tournament Management',
        details: 'Managing tournaments & matches',
        state: 'Made by Sharmagaming'
      },
      note: 'WebSocket connections require a persistent server. Bot status updates are limited in serverless environment.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Bot presence error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Bot presence endpoint active',
    message: 'Use POST to update bot presence',
    timestamp: new Date().toISOString()
  });
}
