import { NextResponse } from 'next/server';
import { 
  getTournamentWinners, 
  saveTournamentWinner 
} from '@/lib/tournament-storage';

// Get all winners
export async function GET() {
  try {
    const winners = await getTournamentWinners('');
    return NextResponse.json(winners);
  } catch (error) {
    console.error('Error fetching winners:', error);
    return NextResponse.json({ error: 'Failed to fetch winners' }, { status: 500 });
  }
}

// Save tournament winner
export async function POST(request: Request) {
  try {
    const { tournamentId, teamId, position, prizeWon } = await request.json();
    
    if (!tournamentId || !teamId || !position) {
      return NextResponse.json({ error: 'Tournament ID, team ID, and position are required' }, { status: 400 });
    }

    const saved = await saveTournamentWinner(tournamentId, teamId, position, prizeWon);

    if (!saved) {
      return NextResponse.json({ error: 'Failed to save tournament winner' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      winner: { tournamentId, teamId, position, prizeWon },
      message: 'Winner saved successfully' 
    });
  } catch (error) {
    console.error('Error saving winner:', error);
    return NextResponse.json({ error: 'Failed to save winner' }, { status: 500 });
  }
}
