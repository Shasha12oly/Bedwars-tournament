import { NextResponse } from 'next/server';
import { getTeams, registerTeam } from '@/lib/firebase-database';

export async function GET() {
  try {
    const teams = await getTeams();
    
    // Enrich teams with tournament names by fetching tournaments
    const { getTournaments } = await import('@/lib/firebase-database');
    const tournaments = await getTournaments();
    
    const teamsWithTournamentNames = teams.map((team: any) => {
      const tournament = tournaments.find((t: any) => t.id === team.tournamentId);
      return {
        ...team,
        tournamentName: tournament?.name || 'Unknown Tournament'
      };
    });

    return NextResponse.json(teamsWithTournamentNames);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const team = await request.json();

    if (!team) {
      return NextResponse.json({ error: 'Missing team data' }, { status: 400 });
    }

    // Register team using Firebase
    const newTeam = await registerTeam(team);

    return NextResponse.json({ 
      success: true, 
      team: newTeam,
      message: 'Team registered successfully!' 
    });

  } catch (error) {
    console.error('Error registering team:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to register team' }, { status: 500 });
  }
}
