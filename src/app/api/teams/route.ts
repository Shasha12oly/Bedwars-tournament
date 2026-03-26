import { NextRequest, NextResponse } from 'next/server';
import { getTeamsFromDatabase, deleteAllTeams } from '@/lib/tournament-storage';

export async function GET(request: NextRequest) {
  try {
    const teams = await getTeamsFromDatabase();
    
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error reading teams data:', error);
    return NextResponse.json(
      { error: 'Failed to load teams data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await deleteAllTeams();
    return NextResponse.json({ 
      success: true, 
      message: 'All teams deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting teams:', error);
    return NextResponse.json({ error: 'Failed to delete teams' }, { status: 500 });
  }
}
