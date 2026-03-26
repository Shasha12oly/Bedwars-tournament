import { NextResponse } from 'next/server';
import { getTeamsFromFile, saveTeamsToFile } from '@/lib/persistent-storage';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Get existing teams
    const teams = await getTeamsFromFile();
    
    // Filter out the team to delete
    const updatedTeams = teams.filter((team: any) => team.id !== teamId);
    
    // Save updated teams
    const saved = await saveTeamsToFile(updatedTeams);
    
    if (!saved) {
      return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Team deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}
