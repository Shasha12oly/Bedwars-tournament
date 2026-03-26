import { NextResponse } from 'next/server';
import { 
  getTeamsFromDatabase,
  deleteTeamFromDatabase,
  getTournamentsFromDatabase,
  initializeDatabase
} from '@/lib/tournament-storage';

export async function POST() {
  try {
    // Initialize database connection
    const pool = await initializeDatabase();
    if (!pool) {
      throw new Error('Database not initialized');
    }

    // Delete all teams
    const teams = await getTeamsFromDatabase();
    for (const team of teams) {
      await deleteTeamFromDatabase(team.id);
    }
    
    // Delete all tournaments
    await pool.query('DELETE FROM tournaments');
    
    // Delete all matches (will be deleted by foreign key cascade)
    await pool.query('DELETE FROM matches');
    
    // Delete all winners
    await pool.query('DELETE FROM tournament_winners');

    return NextResponse.json({ 
      message: 'All data reset successfully!',
      teamsDeleted: teams.length,
      tournamentsDeleted: 'all'
    });

  } catch (error) {
    console.error('Error resetting all data:', error);
    return NextResponse.json({ 
      error: 'Failed to reset data. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
