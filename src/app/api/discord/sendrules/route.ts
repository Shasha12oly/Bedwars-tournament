import { NextResponse } from 'next/server';

const RULES_TEXT = `📋 **BEDWARS TOURNAMENT RULES**\n\n` +
  `✅ **Always Allowed**\n` +
  `- Ladders\n` +
  `- Sponges\n` +
  `- Diamond Sword\n` +
  `- Blue Side Base\n` +
  `- Fireballs — No Fireballs at Diamond Tier 1\n` +
  `- Water — Use only within your own base\n` +
  `- Diamond Armor — Maximum: 2 players per team\n` +
  `- Bridge Eggs — Allowed\n\n` +
  `✅ **After Beds Destroyed**\n` +
  `- TNT\n` +
  `- Iron Golems\n` +
  `- Ender Pearl\n` +
  `- All Side Bases\n` +
  `- Water [Anywhere]\n` +
  `- Knockback Sticks\n` +
  `- Invincibility Star\n` +
  `- Invisibility Potion\n` +
  `- Speed + Jump Potion\n` +
  `- Diamond Armor [No Limit]\n\n` +
  `💀 **Never Allowed**\n` +
  `- Pop-up Towers\n` +
  `- Obsidian\n` +
  `- Bow & Arrows\n` +
  `- Fireballing Diamonds\n\n` +
  `📋 **General Rules**\n` +
  `- No hacks, mods, macros, auto-clickers, or unfair advantages\n` +
  `- No glitch abusing or stream sniping\n` +
  `- Team members must remain the same throughout the tournament\n` +
  `- One Minecraft account and one Discord per player\n` +
  `- Respect all players and staff\n` +
  `- Be on time for matches\n` +
  `- Admin and staff decisions are final\n` +
  `- Rule break = immediate disqualification`;

 const RULES_EMBED = {
   title: '📋 BedWars Tournament Rules',
   color: 0x8b5cf6,
   description: RULES_TEXT,
   footer: { text: '⚔️ BedWars Tournament System' },
   timestamp: new Date().toISOString(),
 };

export async function POST() {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_RULES_CHANNEL_ID || process.env.DISCORD_CHANNEL_ID;
    const pingEveryone = (process.env.DISCORD_PING_EVERYONE ?? 'true').toLowerCase() === 'true';

    if (!botToken) {
      return NextResponse.json({ ok: false, error: 'Missing DISCORD_BOT_TOKEN' }, { status: 500 });
    }

    if (!channelId) {
      return NextResponse.json({ ok: false, error: 'Missing DISCORD_RULES_CHANNEL_ID (or DISCORD_CHANNEL_ID)' }, { status: 500 });
    }

    const discordRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: pingEveryone ? '@everyone' : undefined,
        embeds: [RULES_EMBED],
        allowed_mentions: pingEveryone ? { parse: ['everyone'] } : { parse: [] },
      }),
    });

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
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
