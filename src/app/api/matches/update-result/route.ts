import { NextResponse } from 'next/server';
import { 
  getMatchesFromDatabase, 
  updateMatchResult,
  updateTournamentStatus,
  saveTournamentWinner
} from '@/lib/tournament-storage';
import { updateBracketWithWinner, isTournamentComplete, getTournamentWinner } from '@/lib/tournament-bracket';

export async function POST(request: Request) {
  try {
    const { matchId, winnerId, winnerName, tournamentId } = await request.json();

    if (!matchId || !winnerId || !winnerName || !tournamentId) {
      return NextResponse.json({ error: 'Match ID, winner ID, winner name, and tournament ID are required' }, { status: 400 });
    }

    // Update match result in database
    const updated = await updateMatchResult(matchId, winnerId, winnerName);

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update match result' }, { status: 500 });
    }

    // Get all matches to check if tournament is complete
    const allMatches = await getMatchesFromDatabase(tournamentId);
    const completedMatches = allMatches.filter(match => match.status === 'completed');
    const totalScheduledMatches = allMatches.filter(match => match.team1Id !== '' && match.team2Id !== '');

    // Check if all matches are completed
    if (completedMatches.length === totalScheduledMatches.length) {
      // Tournament is complete
      await updateTournamentStatus(tournamentId, 'completed');
      
      // Save tournament winner
      const finalMatch = allMatches.find(match => match.round === 'Finals');
      if (finalMatch && finalMatch.winnerId) {
        await saveTournamentWinner({
          id: Date.now().toString(),
          tournamentId,
          teamId: finalMatch.winnerId,
          position: 1,
          prizeWon: 'Tournament Winner',
          createdAt: new Date().toISOString()
        });
      }

      return NextResponse.json({
        message: 'Match updated and tournament completed!',
        matchUpdated: true,
        tournamentComplete: true,
        winner: getTournamentWinner({ rounds: organizeMatchesByRound(allMatches) })
      });
    } else {
      return NextResponse.json({
        message: 'Match result updated successfully',
        matchUpdated: true,
        tournamentComplete: false,
        remainingMatches: totalScheduledMatches.length - completedMatches.length
      });
    }

  } catch (error) {
    console.error('Error updating match result:', error);
    return NextResponse.json({ error: 'Failed to update match result' }, { status: 500 });
  }
}

function organizeMatchesByRound(matches: any[]) {
  const rounds = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Finals'];
  return rounds.map(roundName => ({
    name: roundName,
    matches: matches.filter(match => match.round === roundName)
  }));
}
