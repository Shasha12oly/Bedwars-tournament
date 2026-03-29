import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Looking up Discord user via bot:', {
      username,
      timestamp: new Date().toISOString()
    });

    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    if (!botToken) {
      console.warn('⚠️ Discord bot token not configured');
      return NextResponse.json({
        success: false,
        error: 'Discord bot not configured',
        note: 'Set DISCORD_BOT_TOKEN environment variable'
      }, { status: 500 });
    }

    try {
      // Use your existing Discord bot to search for user
      // First get all guilds the bot is in
      const guildsResponse = await fetch('https://discord.com/api/v9/users/@me/guilds', {
        headers: {
          'Authorization': `Bot ${botToken}`,
          'User-Agent': 'BedWarsTournamentBot (https://bedwars-tournament.com, 1.0)'
        }
      });

      if (!guildsResponse.ok) {
        throw new Error('Failed to fetch guilds');
      }

      const guilds = await guildsResponse.json();
      
      // Search through all guilds for the user
      for (const guild of guilds) {
        try {
          // Search for members in this guild
          const membersResponse = await fetch(
            `https://discord.com/api/v9/guilds/${guild.id}/members/search?query=${encodeURIComponent(username)}&limit=10`,
            {
              headers: {
                'Authorization': `Bot ${botToken}`,
                'User-Agent': 'BedWarsTournamentBot (https://bedwars-tournament.com, 1.0)'
              }
            }
          );

          if (membersResponse.ok) {
            const members = await membersResponse.json();
            
            for (const member of members) {
              const userUsername = member.user.username.toLowerCase();
              const searchUsername = username.toLowerCase();
              
              // Check exact match or partial match
              if (userUsername === searchUsername || 
                  userUsername.includes(searchUsername) || 
                  searchUsername.includes(userUsername)) {
                
                console.log('✅ Found Discord user:', {
                  username: member.user.username,
                  discordId: member.user.id,
                  discriminator: member.user.discriminator,
                  timestamp: new Date().toISOString()
                });

                return NextResponse.json({
                  success: true,
                  discordId: member.user.id,
                  username: member.user.username,
                  discriminator: member.user.discriminator,
                  avatar: member.user.avatar,
                  timestamp: new Date().toISOString()
                });
              }
            }
          }
        } catch (memberError) {
          console.warn(`⚠️ Could not search guild ${guild.name}:`, memberError);
          continue;
        }
      }

      // If not found in any guild
      return NextResponse.json({
        success: false,
        error: `User "${username}" not found. Make sure:\n• The username is correct\n• The user is in the same server as the bot\n• The bot has permission to see server members`,
        username: username,
        timestamp: new Date().toISOString()
      });

    } catch (apiError) {
      console.error('❌ Discord API error:', apiError);
      return NextResponse.json(
        { error: 'Discord API error: ' + (apiError instanceof Error ? apiError.message : 'Unknown error') },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error looking up Discord user:', error);
    return NextResponse.json(
      { error: 'Failed to lookup user: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
