import { NextResponse } from 'next/server';
import { mentionForUsernameInGuild } from '@/lib/discord-mentions';

// Discord Gateway connection for "online" status
let gatewayWs: WebSocket | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

async function connectGateway(token: string) {
  if (gatewayWs && gatewayWs.readyState === WebSocket.OPEN) {
    return; // Already connected
  }

  try {
    console.log('🔌 Connecting to Discord Gateway for online status...');
    
    // Get gateway URL
    const gatewayRes = await fetch('https://discord.com/api/v10/gateway', {
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!gatewayRes.ok) {
      console.error('Failed to get gateway URL');
      return;
    }

    const gatewayData = await gatewayRes.json();
    const wsUrl = `${gatewayData.url}?v=10&encoding=json`;

    // Connect WebSocket
    gatewayWs = new WebSocket(wsUrl);
    
    gatewayWs.onopen = () => {
      console.log('✅ Connected to Discord Gateway - Bot will appear online');
      
      // Identify with minimal intents
      gatewayWs!.send(JSON.stringify({
        op: 2, // Identify
        d: {
          token: token,
          intents: 1, // GUILDS only (minimal)
          properties: {
            os: 'linux',
            browser: 'bedwars-tournament-bot',
            device: 'bedwars-tournament'
          }
        }
      }));
      
      // Start heartbeat
      heartbeatInterval = setInterval(() => {
        if (gatewayWs && gatewayWs.readyState === WebSocket.OPEN) {
          gatewayWs.send(JSON.stringify({ op: 1, d: null })); // Heartbeat
        }
      }, 30000); // 30 seconds
    };

    gatewayWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.op === 10) { // Hello
        console.log('👋 Discord Gateway Hello received');
      } else if (data.op === 11) { // Heartbeat ACK
        console.log('💓 Discord Gateway heartbeat ACK');
      }
    };

    gatewayWs.onclose = () => {
      console.log('❌ Discord Gateway disconnected');
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      
      // Reconnect after 5 seconds
      setTimeout(() => connectGateway(token), 5000);
    };

    gatewayWs.onerror = (error) => {
      console.error('❌ Discord Gateway error:', error);
    };

  } catch (error) {
    console.error('❌ Failed to connect to Discord Gateway:', error);
  }
}

// Initialize gateway connection on first API call
let gatewayInitialized = false;

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

    // Initialize gateway connection for "online" status (only once)
    if (!gatewayInitialized) {
      gatewayInitialized = true;
      // Connect gateway in background (don't await)
      connectGateway(botToken);
    }

    const body = await req.json();
    const { team, tournament } = body ?? {};

    if (!team || !tournament) {
      return NextResponse.json({ ok: false, error: 'Missing team or tournament in request body' }, { status: 400 });
    }

    // Parse team members and Discord users (captain first)
    const members = Array.isArray(team.members) ? (team.members as string[]) : [];
    const discordUsers = typeof team.discord === 'string'
      ? team.discord.split(',').map((u: string) => u.trim()).filter(Boolean)
      : [];

    // Resolve Discord usernames -> real userIds for proper pings
    const resolvedMentions: (string | null)[] = await Promise.all(
      members.map(async (_member: string, index: number) => {
        const discordUsername = discordUsers[index];
        if (!discordUsername) return null;
        const { mention } = await mentionForUsernameInGuild({
          botToken,
          guildId,
          usernameOrAt: discordUsername,
        });
        return mention;
      })
    );

    const pingMentions = members.map((member: string, index: number) => {
      const mention = resolvedMentions[index];
      return mention ?? member;
    });

    const allowedUserIds = resolvedMentions
      .filter((m): m is string => Boolean(m))
      .map((m: string) => m.replace('<@', '').replace('>', ''));
    
    // Also resolve reward receiver if provided
    let rewardReceiverMention: string | null = null;
    if (team.rewardReceiver) {
      const rewardUsername = typeof team.rewardReceiver === 'string' ? team.rewardReceiver.trim() : '';
      // Map IGN to corresponding Discord username if available
      const memberIndex = members.findIndex(m => m === rewardUsername);
      const rewardDiscord = memberIndex >= 0 ? discordUsers[memberIndex] : null;
      if (rewardDiscord) {
        const resolved = await mentionForUsernameInGuild({
          botToken,
          guildId,
          usernameOrAt: rewardDiscord,
        });
        rewardReceiverMention = resolved.mention;
        if (resolved.userId) {
          allowedUserIds.push(resolved.userId);
        }
      }
    }
    
    // Remove duplicate user IDs (Discord API rejects duplicates in allowed_mentions)
    const uniqueAllowedUserIds = [...new Set(allowedUserIds)];
    
    // Create member list with only IGNs (no Discord usernames in list)
    const memberList = members.map((member: string, index: number) => {
      return `${pingMentions[index]} (${member})`;
    }).join('\n');

    const embed = {
      title: '🎮 New Team Registration!',
      color: 0x00ff00,
      description: `**👥 Team Members:**\n${memberList}`,
      fields: [
        { name: '🏆 Tournament', value: String(tournament.name ?? 'Unknown'), inline: true },
        { name: '👥 Team Name', value: String(team.name ?? 'Unknown'), inline: true },
        { name: '👑 Captain', value: `${pingMentions[0]} (${String(team.captain ?? 'Unknown')})`, inline: true },
        { name: '🔗 Captain Discord', value: String(discordUsers[0] ?? 'Unknown'), inline: true },
        { name: '📅 Registered At', value: team.registeredAt ? new Date(team.registeredAt).toLocaleString() : new Date().toLocaleString(), inline: true },
        { name: '🎯 Reward Receiver', value: rewardReceiverMention ?? (team.rewardReceiver ? `@${team.rewardReceiver}` : 'Captain'), inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: '⚔️ BedWars Tournament System' },
    };

    // Add beautiful content with pings
    const content = `🎮 **New Team Registration!** 🎉\n\n${pingMentions.join(' ')} - Your team **${team.name}** has been successfully registered for **${tournament.name}**! 🏆`;

    const discordRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        content: content,
        embeds: [embed],
        allowed_mentions: {
          users: uniqueAllowedUserIds,
        }
      }),
    });

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      console.error('Discord API Error:', {
        status: discordRes.status,
        statusText: discordRes.statusText,
        errorText: errorText,
        channelId,
        allowedUserIds,
        contentPreview: content.substring(0, 100)
      });
      return NextResponse.json(
        { ok: false, error: 'Discord API error', status: discordRes.status, details: errorText },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
