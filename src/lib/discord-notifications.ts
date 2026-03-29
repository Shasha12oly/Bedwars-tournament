import { Match } from './firebase-database';

export async function sendMatchCompletionNotification(match: Match, tournamentName: string, winnerDiscordId?: string, loserDiscordId?: string) {
  try {
    // Only send notification if match is completed and has a winner
    if (match.status !== 'completed' || !match.result) {
      console.log('ℹ️ Match not completed or no winner, skipping notification');
      return;
    }

    console.log('🏆 Sending match completion notification for:', match.id);

    const notificationData = {
      matchId: match.id,
      player1: match.player1,
      player2: match.player2,
      winner: match.result,
      loser: match.player1 === match.result ? match.player2 : match.player1, // Determine loser
      winnerDiscordId: winnerDiscordId,
      loserDiscordId: loserDiscordId,
      round: match.round,
      tournamentName: tournamentName
    };

    // Send to Discord channel
    const response = await fetch('/api/discord/match-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to send match notification:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Match completion notification sent:', result);
    return true;

  } catch (error) {
    console.error('❌ Error sending match notification:', error);
    return false;
  }
}

export async function sendTournamentStartNotification(tournamentName: string, teamsCount: number) {
  try {
    console.log('🚀 Sending tournament start notification:', tournamentName);

    const notificationData = {
      type: 'tournament_start',
      tournamentName,
      teamsCount,
      message: `🎮 **${tournamentName} has started!**\n\n👥 **${teamsCount} teams** are participating\n\nGood luck to all participants!`
    };

    const response = await fetch('/api/discord/match-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to send tournament start notification:', error);
      return false;
    }

    console.log('✅ Tournament start notification sent');
    return true;

  } catch (error) {
    console.error('❌ Error sending tournament start notification:', error);
    return false;
  }
}
