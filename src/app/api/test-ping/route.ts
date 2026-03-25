import { NextResponse } from 'next/server';
import { mentionForUsernameInGuild } from '@/lib/discord-mentions';

export async function POST(req: Request) {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_CHANNEL_ID;
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!botToken) {
      return NextResponse.json({ ok: false, error: 'Missing DISCORD_BOT_TOKEN' }, { status: 500 });
    }

    if (!channelId) {
      return NextResponse.json({ ok: false, error: 'Missing DISCORD_CHANNEL_ID' }, { status: 500 });
    }

    if (!guildId) {
      return NextResponse.json({ ok: false, error: 'Missing DISCORD_GUILD_ID' }, { status: 500 });
    }

    const body = await req.json();
    const { username } = body ?? {};

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ ok: false, error: 'Username is required' }, { status: 400 });
    }

    const { mention, userId } = await mentionForUsernameInGuild({
      botToken,
      guildId,
      usernameOrAt: username,
    });

    const cleanUsername = username.trim();

    const content = mention && userId
      ? `🔔 **Ping Test**\n\nResolved **${cleanUsername}** -> <@${userId}>\n\n${mention}`
      : `🔔 **Ping Test**\n\nCould not find **${cleanUsername}** in this server.\n\n(No ping sent)`;

    const discordRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        allowed_mentions: mention && userId ? { users: [userId] } : { users: [] },
      }),
    });

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      console.error('Discord API Error Details:', {
        status: discordRes.status,
        statusText: discordRes.statusText,
        errorText: errorText
      });
      return NextResponse.json(
        { ok: false, error: 'Discord API error', status: discordRes.status, details: errorText },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, resolved: Boolean(mention), userId });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
