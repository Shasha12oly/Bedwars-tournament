import { NextResponse } from 'next/server';
import { 
  getTeamsHybrid, 
  saveTeamsHybrid, 
  getTournamentsHybrid, 
  getTeamCountHybrid
} from '@/lib/hybrid-storage';

export async function GET() {
  try {
    const tournaments = await getTournamentsHybrid();
    const teams = await getTeamsHybrid();
    
    // Add team counts to tournaments
    const tournamentsWithCounts = tournaments.map((tournament: any) => ({
      ...tournament,
      currentTeams: teams.filter((team: any) => team.tournamentId === tournament.id).length
    }));

    return NextResponse.json(tournamentsWithCounts);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { tournament, team }: { tournament: any; team: any } = await request.json();

    if (!tournament || !team) {
      return NextResponse.json({ error: 'Missing tournament or team data' }, { status: 400 });
    }

    // Get existing teams
    const teams = await getTeamsHybrid();
    
    // Check for duplicate team name
    const existingTeam = teams.find((t: any) => 
      t.tournamentId === tournament.id && t.name.toLowerCase() === team.name.toLowerCase()
    );

    if (existingTeam) {
      return NextResponse.json({ error: 'Team name already exists for this tournament' }, { status: 400 });
    }

    // Check tournament capacity
    const currentTeams = await getTeamCountHybrid(tournament.id);
    const maxSlots = tournament.maxSlots || 16;

    if (currentTeams >= maxSlots) {
      return NextResponse.json({ error: 'Tournament is full' }, { status: 400 });
    }

    // Create new team with registration data
    const newTeam = {
      id: Date.now().toString(),
      tournamentId: tournament.id,
      name: team.name,
      captain: team.captain,
      members: team.members,
      discordUsers: team.discordUsers,
      rewardReceiver: team.rewardReceiver,
      registeredAt: new Date().toISOString(),
      status: 'registered'
    };

    // Save team (Discord + LocalStorage backup)
    teams.push(newTeam);
    const saved = await saveTeamsHybrid(teams);

    if (!saved) {
      return NextResponse.json({ error: 'Failed to save team registration' }, { status: 500 });
    }

    // Trigger Discord notification
    try {
      const discordResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/discord/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team: newTeam,
          tournament: tournament
        }),
      });

      if (discordResponse.ok) {
        const discordResult = await discordResponse.json();
        console.log('Discord notification sent successfully:', discordResult);
      } else {
        console.error('Discord notification failed:', await discordResponse.text());
      }
    } catch (discordError) {
      console.error('Error sending Discord notification:', discordError);
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
