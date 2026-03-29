import { NextRequest, NextResponse } from 'next/server';
import { mentionForUsernameInGuild } from '@/lib/discord-mentions';

export async function POST(request: NextRequest) {
  try {
    const { matchId, player1, player2, winner, loser, winnerDiscordId, loserDiscordId, round, tournamentName } = await request.json();

    if (!matchId || !player1 || !player2 || !winner) {
      return NextResponse.json(
        { error: 'Match details are required' },
        { status: 400 }
      );
    }

    const channelId = '1487707946862510210'; // Your Discord channel ID
    
    console.log('🏆 Sending match completion notification via Discord bot:', {
      matchId,
      player1,
      player2,
      winner,
      loser,
      winnerDiscordId,
      loserDiscordId,
      round,
      tournamentName,
      channelId,
      timestamp: new Date().toISOString()
    });

    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    
    if (!botToken) {
      console.warn('⚠️ Discord bot token not configured');
      return NextResponse.json({
        success: false,
        error: 'Discord bot not configured',
        note: 'Set DISCORD_BOT_TOKEN environment variable'
      }, { status: 500 });
    }

    if (!guildId) {
      console.warn('⚠️ Discord guild ID not configured');
      return NextResponse.json({
        success: false,
        error: 'Discord guild not configured',
        note: 'Set DISCORD_GUILD_ID environment variable'
      }, { status: 500 });
    }

    try {
      // Resolve Discord usernames -> real userIds for proper pings (just like team registration)
      let winnerMention: string | null = null;
      let loserMention: string | null = null;
      let winnerUserId: string | null = null;
      let loserUserId: string | null = null;

      if (winnerDiscordId) {
        try {
          const result = await mentionForUsernameInGuild({
            botToken,
            guildId,
            usernameOrAt: winnerDiscordId,
          });
          winnerMention = result.mention;
          winnerUserId = result.userId;
        } catch (error) {
          console.warn('⚠️ Could not resolve winner Discord user:', error);
          winnerMention = `@${winnerDiscordId}`;
        }
      }

      if (loserDiscordId) {
        try {
          const result = await mentionForUsernameInGuild({
            botToken,
            guildId,
            usernameOrAt: loserDiscordId,
          });
          loserMention = result.mention;
          loserUserId = result.userId;
        } catch (error) {
          console.warn('⚠️ Could not resolve loser Discord user:', error);
          loserMention = `@${loserDiscordId}`;
        }
      }

      // Create pings using resolved mentions
      const pings = `${winnerMention ? winnerMention + ' 🏆 ' : ''}${loserMention ? loserMention + ' ' : ''}`.trim();

      console.log(`🔍 Resolved Discord mentions - Winner: ${winnerMention} (ID: ${winnerUserId}), Loser: ${loserMention} (ID: ${loserUserId})`);

      // Create match completion message with resolved pings
      const content = `${pings}\n\n🏆 **Match Completed!**\n\n📋 **Match Details:**\n• **Match ID:** ${matchId}\n• **Round:** ${round}\n• **Tournament:** ${tournamentName}\n\n⚔️ **Players:**\n• ${player1} vs ${player2}\n\n🎉 **Winner:** **${winner}**\n\n*Match completion notification from BedWars Tournament System*`;

      // Create embed with match details
      const embed = {
        title: 'Match Completed',
        description: `${player1} vs ${player2}`,
        color: 5814783, // Green color
        fields: [
          {
            name: '🏆 Winner',
            value: `**${winner}**${winnerMention ? ` (${winnerMention})` : ''}`,
            inline: true
          },
          {
            name: '📋 Round',
            value: round,
            inline: true
          },
          {
            name: '🏆 Tournament',
            value: tournamentName,
            inline: true
          }
        ],
        timestamp: new Date().toISOString()
      };

      // Prepare allowed mentions for Discord API
      const allowedUserIds = [winnerUserId, loserUserId].filter((id): id is string => Boolean(id));

      console.log('📝 Sending Discord message with data:', {
        content: content.substring(0, 200),
        embed: embed,
        allowedUserIds,
        channelId,
        botToken: botToken ? `${botToken.substring(0, 10)}...` : 'MISSING'
      });

      // Send message using Discord bot API (exactly like team registration)
      const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: content,
          embeds: [embed],
          allowed_mentions: {
            users: allowedUserIds,
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Failed to send Discord message via bot:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to send Discord message via bot',
          details: error
        }, { status: 500 });
      }

      const result = await response.json();
      console.log('✅ Match completion notification sent via Discord bot');
      
      return NextResponse.json({
        success: true,
        message: 'Match completion notification sent via Discord bot',
        matchId,
        winner,
        loser,
        winnerMention,
        loserMention,
        winnerUserId,
        loserUserId,
        channelId,
        messageId: result.id,
        timestamp: new Date().toISOString()
      });

    } catch (apiError) {
      console.error('❌ Discord API error:', apiError);
      return NextResponse.json({
        success: false,
        error: 'Discord API error: ' + (apiError instanceof Error ? apiError.message : 'Unknown error')
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error sending match notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
