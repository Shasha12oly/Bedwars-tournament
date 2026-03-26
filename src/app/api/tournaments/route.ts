import { NextResponse } from 'next/server';
import { getTeamsFromFile, saveTeamsToFile, getTournamentsFromFile, getTeamCountFromFile } from '@/lib/persistent-storage';

export async function GET() {
  try {
    const tournaments = await getTournamentsFromFile();
    const teams = await getTeamsFromFile();
    
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
    const teams = await getTeamsFromFile();
    
    // Check for duplicate team name
    const existingTeam = teams.find((t: any) => 
      t.tournamentId === tournament.id && t.name.toLowerCase() === team.name.toLowerCase()
    );

    if (existingTeam) {
      return NextResponse.json({ error: 'Team name already exists for this tournament' }, { status: 400 });
    }

    // Check tournament capacity
    const currentTeams = await getTeamCountFromFile(tournament.id);
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

    // Save team to file
    teams.push(newTeam);
    const saved = await saveTeamsToFile(teams);

    if (!saved) {
      return NextResponse.json({ error: 'Failed to save team registration' }, { status: 500 });
    }

    // Trigger Discord notification
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      console.log('🔔 Sending Discord notification to:', `${baseUrl}/api/discord/register`);
      console.log('📝 Team data:', newTeam);
      console.log('🏆 Tournament data:', tournament);
      
      const discordResponse = await fetch(`${baseUrl}/api/discord/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team: newTeam,
          tournament: tournament
        }),
      });

      console.log('📡 Discord API response status:', discordResponse.status);
      
      if (discordResponse.ok) {
        const discordResult = await discordResponse.json();
        console.log('✅ Discord notification sent successfully:', discordResult);
      } else {
        const errorText = await discordResponse.text();
        console.error('❌ Discord notification failed:', discordResponse.status, errorText);
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
