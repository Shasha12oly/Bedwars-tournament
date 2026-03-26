import { NextResponse } from 'next/server';
import { getTeamsFromDatabase, deleteTeamFromDatabase } from '@/lib/tournament-storage';

export async function POST() {
  try {
    // Get all teams and delete them one by one
    const teams = await getTeamsFromDatabase();
    
    for (const team of teams) {
      await deleteTeamFromDatabase(team.id);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All team registrations have been reset' 
    });

  } catch (error) {
    console.error('Error resetting teams:', error);
    return NextResponse.json({ error: 'Failed to reset teams' }, { status: 500 });
  }
}
