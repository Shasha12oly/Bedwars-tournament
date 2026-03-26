import { NextResponse } from 'next/server';
import { updateTournamentStatus, getTeamsFromDatabase, getMatchesFromDatabase, saveMatchToDatabase, clearMatchesFromDatabase } from '@/lib/tournament-storage';
import { generateTournamentBracket } from '@/lib/tournament-bracket';

export async function POST(request: Request) {
  try {
    const { tournamentId } = await request.json();

    if (!tournamentId) {
      return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 });
    }

    console.log(`🔒 Closing registration for tournament ${tournamentId} and generating bracket...`);

    // Update tournament status to 'closed'
    const updated = await updateTournamentStatus(tournamentId, 'closed');

    if (!updated) {
      return NextResponse.json({ error: 'Failed to close registration' }, { status: 500 });
    }

    // Get teams for the tournament
    const teams = await getTeamsFromDatabase();
    const tournamentTeams = teams.filter(team => team.tournament_id === tournamentId);

    if (tournamentTeams.length < 2) {
      return NextResponse.json({ 
        error: 'Need at least 2 teams to generate bracket',
        success: false 
      }, { status: 400 });
    }

    console.log(`📊 Found ${tournamentTeams.length} teams, generating bracket...`);

    // Check if matches already exist to avoid unnecessary regeneration
    const existingMatches = await getMatchesFromDatabase(tournamentId);
    if (existingMatches.length > 0) {
      console.log(`ℹ️ Matches already exist for tournament ${tournamentId} (${existingMatches.length}). Skipping bracket generation.`);
      return NextResponse.json({
        message: 'Registration closed. Bracket already exists.',
        success: true,
        matchesGenerated: 0,
        teamsInTournament: tournamentTeams.length
      });
    }

    // Generate tournament bracket
    console.log('🏗️ Calling generateTournamentBracket with:', tournamentTeams.length, 'teams');
    const bracket = generateTournamentBracket(tournamentTeams, tournamentId);
    console.log('📊 Generated bracket:', JSON.stringify(bracket, null, 2));
    // Only save Round of 16 matches (actual teams), later rounds will be generated dynamically
    const matchesToSave = bracket.rounds.find(r => r.name === 'Round of 16')?.matches || [];
    console.log('🎯 Matches to save:', matchesToSave.length);

    // Save all matches to database
    let savedMatches = 0;
    for (const match of matchesToSave) {
      console.log('💾 Saving match:', match.id, match.team1Name, 'vs', match.team2Name);
      const saved = await saveMatchToDatabase(match);
      if (saved) {
        savedMatches++;
        console.log('✅ Successfully saved match:', match.id);
      } else {
        console.log('❌ Failed to save match:', match.id);
      }
    }

    // Update tournament status to 'in_progress' since bracket is ready
    await updateTournamentStatus(tournamentId, 'in_progress');

    console.log(`✅ Successfully generated bracket with ${savedMatches} matches for tournament ${tournamentId}`);

    return NextResponse.json({
      message: `Registration closed and tournament bracket automatically generated with ${savedMatches} matches!`,
      success: true,
      matchesGenerated: savedMatches,
      teamsInTournament: tournamentTeams.length
    });

  } catch (error) {
    console.error('Error closing registration and generating bracket:', error);
    return NextResponse.json({ error: 'Failed to close registration and generate bracket' }, { status: 500 });
  }
}
