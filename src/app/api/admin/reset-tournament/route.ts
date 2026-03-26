import { NextResponse } from 'next/server';
import { 
  getTeamsFromDatabase,
  deleteTeamFromDatabase,
  updateTournamentStatus
} from '@/lib/tournament-storage';

export async function POST() {
  try {
    // Get all teams and delete them from database
    const teams = await getTeamsFromDatabase();
    
    for (const team of teams) {
      await deleteTeamFromDatabase(team.id);
    }
    
    // Reset tournament status to open
    await updateTournamentStatus('1', 'open');
    
    return NextResponse.json({ 
      message: 'All registrations and matches have been reset successfully!',
      teamsDeleted: teams.length
    });

  } catch (error) {
    console.error('Error resetting tournament:', error);
    return NextResponse.json({ 
      error: 'Failed to reset tournament. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
