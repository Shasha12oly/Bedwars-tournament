import { NextRequest, NextResponse } from 'next/server';
import { updateMatchStatus } from '@/lib/matches-storage';

export async function POST(request: NextRequest) {
  try {
    const { matchId, status } = await request.json();
    
    if (!matchId || !status) {
      return NextResponse.json({ error: 'Match ID and status are required' }, { status: 400 });
    }

    const updatedMatch = updateMatchStatus(matchId, status);
    
    if (!updatedMatch) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      match: updatedMatch,
      message: `Match status updated to ${status}` 
    });
  } catch (error) {
    console.error('Error updating match status:', error);
    return NextResponse.json({ error: 'Failed to update match status' }, { status: 500 });
  }
}
