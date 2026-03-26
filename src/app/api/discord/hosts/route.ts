import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    const hostRoleId = process.env.DISCORD_HOST_ROLE_ID;

    if (!botToken || !guildId) {
      return NextResponse.json({ error: 'Missing Discord configuration' }, { status: 500 });
    }

    // Fetch all guild members
    const membersRes = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!membersRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch Discord members' }, { status: 500 });
    }

    const members = await membersRes.json();

    // Filter members who have the host role
    const hosts = members
      .filter((member: any) => member.roles && member.roles.includes(hostRoleId))
      .map((member: any) => ({
        id: member.user.id,
        displayName: member.nick || member.user.username,
      }));

    return NextResponse.json({ hosts });
  } catch (error) {
    console.error('Error fetching Discord hosts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
