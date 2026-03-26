import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_CHANNEL_ID;
    const guildId = process.env.DISCORD_GUILD_ID;
    
    console.log('🔍 Discord Environment Check:', {
      botTokenPresent: !!botToken,
      botTokenLength: botToken ? botToken.length : 0,
      channelIdPresent: !!channelId,
      guildIdPresent: !!guildId,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    });

    if (!botToken || !channelId || !guildId) {
      return NextResponse.json({
        success: false,
        error: 'Missing Discord environment variables',
        config: {
          botToken: !!botToken,
          channelId: !!channelId,
          guildId: !!guildId
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Discord environment variables configured correctly',
      config: {
        botToken: botToken ? 'Present' : 'Missing',
        channelId: channelId || 'Missing',
        guildId: guildId || 'Missing',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      }
    });
  } catch (error) {
    console.error('Test Discord endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
