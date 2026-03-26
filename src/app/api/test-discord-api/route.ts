import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('🔍 Testing Discord API connectivity...');
    
    // Test environment variables
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_CHANNEL_ID;
    const guildId = process.env.DISCORD_GUILD_ID;

    console.log('🔑 Environment Variables Check:', {
      hasBotToken: !!botToken,
      hasChannelId: !!channelId,
      hasGuildId: !!guildId,
      botTokenLength: botToken ? botToken.length : 0,
      botTokenPrefix: botToken ? botToken.substring(0, 10) : 'MISSING'
    });

    if (!botToken || !channelId || !guildId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Missing environment variables',
        details: {
          hasBotToken: !!botToken,
          hasChannelId: !!channelId,
          hasGuildId: !!guildId
        }
      }, { status: 500 });
    }

    // Test basic Discord API connectivity
    const gatewayTest = await fetch('https://discord.com/api/v10/gateway', {
      method: 'GET',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      }
    });

    const channelTest = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      }
    });

    const results = {
      gateway: {
        status: gatewayTest.status,
        statusText: gatewayTest.statusText,
        ok: gatewayTest.ok
      },
      channel: {
        status: channelTest.status,
        statusText: channelTest.statusText,
        ok: channelTest.ok
      }
    };

    console.log('📊 API Test Results:', results);

    return NextResponse.json({ 
      ok: true, 
      message: 'Discord API connectivity test completed',
      results
    });

  } catch (error) {
    console.error('❌ Discord API test error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
