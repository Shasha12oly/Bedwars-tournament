import { NextResponse } from 'next/server';
import { 
  getTeamsHybrid, 
  saveTeamsHybrid, 
  getTournamentsHybrid,
  getTeamCountHybrid
} from '@/lib/hybrid-storage';

export async function GET() {
  try {
    const teams = await getTeamsHybrid();
    const tournaments = await getTournamentsHybrid();
    
    // Enrich teams with tournament names
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

    // Get existing teams
    const teams = await getTeamsHybrid();
    
    // Check for duplicate team name in same tournament
    const existingTeam = teams.find((t: any) => 
      t.tournamentId === team.tournamentId && t.name.toLowerCase() === team.name.toLowerCase()
    );

    if (existingTeam) {
      return NextResponse.json({ error: 'Team name already exists for this tournament' }, { status: 400 });
    }

    // Create new team with registration data
    const newTeam = {
      id: Date.now().toString(),
      ...team,
      registeredAt: new Date().toISOString(),
      status: 'registered'
    };

    // Save team (Discord + LocalStorage backup)
    teams.push(newTeam);
    const saved = await saveTeamsHybrid(teams);

    if (!saved) {
      return NextResponse.json({ error: 'Failed to save team registration' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      team: newTeam,
      message: 'Team registered successfully!' 
    });

  } catch (error) {
    console.error('Error registering team:', error);
    return NextResponse.json({ error: 'Failed to register team' }, { status: 500 });
  }
}
