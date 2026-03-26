import { NextRequest, NextResponse } from 'next/server';
import { getAllMatches, generateTournamentBracket, deleteAllMatches } from '@/lib/matches-storage';

// Get all matches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    const matches = getAllMatches(tournamentId || '1');
    console.log('🔍 Matches data from JSON storage:', matches);
    
    return NextResponse.json(matches);
  } catch (error) {
    console.error('❌ Error reading matches from storage:', error);
    return NextResponse.json([]);
  }
}

// Generate tournament bracket
export async function POST(request: NextRequest) {
  try {
    const { tournamentId, tournamentName, action } = await request.json();
    
    if (action === 'generate-bracket') {
      const matches = await generateTournamentBracket(tournamentId || '1', tournamentName || 'Blood Rush BedWars');
      return NextResponse.json(matches);
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST matches:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Delete all matches
export async function DELETE() {
  try {
    await deleteAllMatches('1');
    return NextResponse.json({ 
      success: true, 
      message: 'All matches deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting matches:', error);
    return NextResponse.json({ error: 'Failed to delete matches' }, { status: 500 });
  }
}
