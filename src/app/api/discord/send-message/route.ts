import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    if (!botToken) {
      return NextResponse.json({ ok: false, error: 'Missing DISCORD_BOT_TOKEN' }, { status: 500 });
    }

    const { channelId, message } = await req.json();

    if (!channelId || !message) {
      return NextResponse.json({ ok: false, error: 'Missing channelId or message' }, { status: 400 });
    }

    console.log('📨 Sending custom message to Discord channel:', channelId);
    console.log('📝 Message content:', message.substring(0, 200));

    // Create a beautiful embed for the message
    const embed = {
      title: '📨 Announcement',
      description: message,
      color: 0x00ff00,
      timestamp: new Date().toISOString(),
      footer: { text: '⚔️ BedWars Tournament Bot made by Sharmagaming' },
    };

    const discordRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
        allowed_mentions: { parse: [] },
      }),
    });

    console.log('📊 Discord API Response:', {
      status: discordRes.status,
      statusText: discordRes.statusText,
      ok: discordRes.ok
    });

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      console.error('❌ Discord API Error:', {
        status: discordRes.status,
        statusText: discordRes.statusText,
        errorText: errorText,
        channelId
      });
      return NextResponse.json(
        { ok: false, error: 'Discord API error', status: discordRes.status, details: errorText },
        { status: 502 }
      );
    }

    const responseData = await discordRes.json();
    console.log('✅ Custom message sent successfully!');
    console.log('📨 Message ID:', responseData.id);

    return NextResponse.json({ 
      ok: true, 
      messageId: responseData.id,
      details: 'Custom message sent to Discord channel',
      channelId: channelId
    });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('❌ Error sending custom message:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
