import { NextResponse } from 'next/server';
import { 
  getTeamsFromDatabase, 
  getMatchesFromDatabase,
  saveTeamToDatabase, 
  getTournamentsFromDatabase, 
  getTeamCountFromDatabase,
  saveMatchToDatabase,
  updateTournamentStatus
} from '@/lib/tournament-storage';

export async function GET() {
  try {
    const tournaments = await getTournamentsFromDatabase();
    const teams = await getTeamsFromDatabase();
    
    // Add team counts to tournaments
    const tournamentsWithCounts = tournaments.map((tournament: any) => {
      const teamCount = teams.filter((team: any) => team.tournament_id === tournament.id).length;
      console.log(`Tournament ${tournament.name} (${tournament.id}): ${teamCount} teams`);
      return {
        ...tournament,
        currentTeams: teamCount
      };
    });

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
    const teams = await getTeamsFromDatabase();
    
    // Check for duplicate team name
    const existingTeam = teams.find((t: any) => 
      t.tournament_id === tournament.id && t.name.toLowerCase() === team.name.toLowerCase()
    );

    if (existingTeam) {
      return NextResponse.json({ error: 'Team name already exists for this tournament' }, { status: 400 });
    }

    // Check tournament capacity
    const currentTeams = await getTeamCountFromDatabase(tournament.id);
    const maxSlots = tournament.max_slots || 16;

    console.log('Team registration check:', {
      tournamentId: tournament.id,
      currentTeams: currentTeams,
      maxSlots: maxSlots,
      tournamentData: tournament
    });

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

    // Save team to database
    console.log('📝 Attempting to save team to database:', newTeam);
    const saved = await saveTeamToDatabase(newTeam);

    if (!saved) {
      console.error('❌ Failed to save team to database');
      return NextResponse.json({ error: 'Failed to save team registration' }, { status: 500 });
    }

    console.log('✅ Team saved successfully to database');

    // Check if tournament is now full and automatically close registration and generate bracket
    const updatedTeamCount = currentTeams + 1;
    if (updatedTeamCount >= maxSlots) {
      console.log(`🏁 Tournament is now full (${updatedTeamCount}/${maxSlots}). Auto-closing registration and generating bracket...`);
      
      // Close registration first
      const closed = await updateTournamentStatus(tournament.id, 'closed');
      if (!closed) {
        console.error('❌ Failed to auto-close registration');
      } else {
        console.log('✅ Registration automatically closed - tournament is full');
        
        // Generate bracket automatically
        try {
          // Get all teams for this tournament including the newly registered one
          const allTeams = await getTeamsFromDatabase();
          const tournamentTeams = allTeams.filter(team => team.tournament_id === tournament.id);
          
          if (tournamentTeams.length >= 2) {
            console.log(`🏗️ Auto-generating bracket for ${tournamentTeams.length} teams...`);

            // Idempotency: if matches already exist, don't create duplicates
            const existingMatches = await getMatchesFromDatabase(tournament.id);
            if (existingMatches.length > 0) {
              console.log(`ℹ️ Matches already exist for tournament ${tournament.id} (${existingMatches.length}). Skipping bracket generation.`);
              await updateTournamentStatus(tournament.id, 'in_progress');
            } else {
            
            // Import bracket functions
            const { generateTournamentBracket } = await import('@/lib/tournament-bracket');
            
            // Generate bracket
            const bracket = generateTournamentBracket(tournamentTeams, tournament.id);
            const matchesToSave = bracket.rounds.flatMap((r: any) => r.matches);
            
            // Save all matches
            let savedMatches = 0;
            for (const match of matchesToSave) {
              const saved = await saveMatchToDatabase(match);
              if (saved) {
                savedMatches++;
              }
            }
            
            // Update tournament status to in_progress
            await updateTournamentStatus(tournament.id, 'in_progress');
            
            console.log(`✅ Auto-generated bracket with ${savedMatches} matches!`);
            }
          }
        } catch (bracketError) {
          console.error('❌ Failed to auto-generate bracket:', bracketError);
        }
      }
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

    const isNowFull = updatedTeamCount >= maxSlots;
    return NextResponse.json({ 
      success: true, 
      message: isNowFull 
        ? 'Team registered successfully! Tournament is now full - registration has been automatically closed and the bracket has been generated!' 
        : 'Team registered successfully!',
      team: newTeam,
      tournamentFull: isNowFull,
      registrationAutoClosed: isNowFull,
      bracketAutoGenerated: isNowFull
    });

  } catch (error) {
    console.error('Error registering team:', error);
    return NextResponse.json({ error: 'Failed to register team' }, { status: 500 });
  }
}
