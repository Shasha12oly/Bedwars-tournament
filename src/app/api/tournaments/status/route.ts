import { NextResponse } from 'next/server';
import { updateTournamentStatus } from '@/lib/tournament-storage';

export async function POST(request: Request) {
  try {
    const { tournamentId, status } = await request.json();
    
    if (!tournamentId || !status) {
      return NextResponse.json({ error: 'Tournament ID and status are required' }, { status: 400 });
    }

    const updated = await updateTournamentStatus(tournamentId, status);

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update tournament status' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tournament status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating tournament status:', error);
    return NextResponse.json({ error: 'Failed to update tournament status' }, { status: 500 });
  }
}
