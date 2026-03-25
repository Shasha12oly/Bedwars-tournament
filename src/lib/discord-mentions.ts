type DiscordMember = {
  user?: {
    id: string;
    username: string;
    global_name?: string | null;
    discriminator?: string;
  };
  nick?: string | null;
};

const normalizeName = (s: string) => s.trim().toLowerCase();

export async function resolveDiscordUserIdFromGuild(params: {
  botToken: string;
  guildId: string;
  query: string;
}): Promise<string | null> {
  const { botToken, guildId, query } = params;
  const q = query.trim();
  if (!q) return null;

  const url = `https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/members/search?query=${encodeURIComponent(q)}&limit=10`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
    // Next route handlers run on Node; disable caching explicitly
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }

  const members = (await res.json()) as DiscordMember[];
  if (!Array.isArray(members) || members.length === 0) return null;

  // Prefer exact match on username / nick / global_name
  const wanted = normalizeName(q);
  const exact = members.find(m => {
    const username = m.user?.username ? normalizeName(m.user.username) : '';
    const global = m.user?.global_name ? normalizeName(m.user.global_name) : '';
    const nick = m.nick ? normalizeName(m.nick) : '';
    return username === wanted || global === wanted || nick === wanted;
  });

  const chosen = exact ?? members[0];
  return chosen.user?.id ?? null;
}

export async function mentionForUsernameInGuild(params: {
  botToken: string;
  guildId: string;
  usernameOrAt: string;
}): Promise<{ mention: string | null; userId: string | null }>{
  const raw = params.usernameOrAt.trim();
  const cleaned = raw.startsWith('@') ? raw.slice(1) : raw;

  const userId = await resolveDiscordUserIdFromGuild({
    botToken: params.botToken,
    guildId: params.guildId,
    query: cleaned,
  });

  if (!userId) return { mention: null, userId: null };
  return { mention: `<@${userId}>`, userId };
}
