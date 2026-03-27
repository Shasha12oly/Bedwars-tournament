import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    if (!botToken) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Missing DISCORD_BOT_TOKEN' 
      }, { status: 500 });
    }

    // Get Discord Gateway URL
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
    
    console.log('🔗 Gateway URL retrieved:', gatewayData.url);
    
    return NextResponse.json({ 
      ok: true, 
      url: gatewayData.url,
      shards: gatewayData.shards,
      session_start_limit: gatewayData.session_start_limit
    });

  } catch (error) {
    console.error('❌ Gateway error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
