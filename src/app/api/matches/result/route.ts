import { NextResponse } from 'next/server';
import { updateMatchStatus, updateMatchPlayers, getAllMatches } from '@/lib/matches-storage';

export async function POST(request: Request) {
  try {
    const { matchId, winnerId, winnerName, status } = await request.json();
    
    if (!matchId || !winnerName) {
      return NextResponse.json({ error: 'Match ID and winner name are required' }, { status: 400 });
    }

    // Update the match with winner
    const updatedMatch = updateMatchStatus(
      matchId, 
      status || 'completed', 
      `${winnerName} won`
    );
    
    if (!updatedMatch) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Update next round matches with winner
    updateNextRoundMatches(updatedMatch, winnerName);

    return NextResponse.json({ 
      success: true, 
      match: updatedMatch,
      message: `Match completed! ${winnerName} advances to next round` 
    });
  } catch (error) {
    console.error('Error updating match result:', error);
    return NextResponse.json({ error: 'Failed to update match result' }, { status: 500 });
  }
}

async function updateNextRoundMatches(completedMatch: any, winnerName: string) {
  const roundOrder = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];
  const currentRoundIndex = roundOrder.indexOf(completedMatch.round);
  const nextRound = roundOrder[currentRoundIndex + 1];
  
  if (!nextRound) return;

  const allMatches = await getAllMatches('1');
  const currentRoundMatches = allMatches.filter(m => m.round === completedMatch.round);
  const currentMatchIndex = currentRoundMatches.findIndex(m => m.id === completedMatch.id);
  
  const nextRoundSlotIndex = Math.floor(currentMatchIndex / 2);
  const nextRoundMatches = allMatches.filter(m => m.round === nextRound);
  const targetMatch = nextRoundMatches[nextRoundSlotIndex];

  if (targetMatch) {
    if (targetMatch.player1.includes('Winner of')) {
      await updateMatchPlayers(targetMatch.id, winnerName, targetMatch.player2);
    } else if (targetMatch.player2.includes('Winner of')) {
      await updateMatchPlayers(targetMatch.id, targetMatch.player1, winnerName);
    }
  }
}
