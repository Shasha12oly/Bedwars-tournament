import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('💓 Manual heartbeat requested from bot test panel');
    
    // Test environment variables
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_CHANNEL_ID;
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!botToken) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Missing DISCORD_BOT_TOKEN environment variable',
        gatewayStatus: 'Not configured'
      }, { status: 500 });
    }

    if (!channelId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Missing DISCORD_CHANNEL_ID environment variable',
        gatewayStatus: 'Not configured'
      }, { status: 500 });
    }

    if (!guildId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Missing DISCORD_GUILD_ID environment variable',
        gatewayStatus: 'Not configured'
      }, { status: 500 });
    }

    // Test Discord API connectivity
    const gatewayRes = await fetch('https://discord.com/api/v10/gateway', {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!gatewayRes.ok) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Failed to connect to Discord Gateway API',
        gatewayStatus: 'API Error'
      }, { status: 502 });
    }

    const gatewayData = await gatewayRes.json();
    
    // Send a simple heartbeat message to test bot status
    try {
      const messageRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: '💓 **Bot Heartbeat Test** - Bot is responding to manual heartbeat requests!',
          embeds: [{
            title: '🤖 Bot Status',
            description: '✅ **Bot Online**\n\n💓 Heartbeat sent successfully\n🔌 Gateway connected',
            color: 0x00ff00,
            timestamp: new Date().toISOString(),
            footer: { text: 'Manual heartbeat from test panel' }
          }]
        }),
      });

      if (messageRes.ok) {
        console.log('✅ Heartbeat message sent to Discord');
        return NextResponse.json({ 
          ok: true, 
          gatewayStatus: 'Connected',
          message: 'Heartbeat sent successfully',
          gatewayUrl: gatewayData.url
        });
      } else {
        const errorText = await messageRes.text();
        console.error('❌ Failed to send heartbeat message:', errorText);
        return NextResponse.json({ 
          ok: false, 
          error: 'Failed to send heartbeat message',
          details: errorText,
          gatewayStatus: 'Message Failed'
        }, { status: 502 });
      }
    } catch (error) {
      console.error('❌ Heartbeat error:', error);
      return NextResponse.json({ 
        ok: false, 
        error: 'Heartbeat failed',
        gatewayStatus: 'Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Heartbeat endpoint error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Heartbeat endpoint failed',
      gatewayStatus: 'Critical Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
