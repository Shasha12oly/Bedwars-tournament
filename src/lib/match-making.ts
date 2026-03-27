import { getTeams, updateMatches, getTournament, updateTournament, resetTournamentMatches } from './firebase-database';
import { Match, Team } from './firebase-database';

interface MatchMakingResult {
  matches: Match[];
  tournamentId: string;
  totalTeams: number;
  bracketGenerated: boolean;
}

export async function generateTournamentMatches(tournamentId: string): Promise<MatchMakingResult> {
  try {
    console.log('🏆 Starting automatic match making for tournament:', tournamentId);
    
    // Get all teams for the tournament
    const teams = await getTeams(tournamentId);
    console.log(`📊 Found ${teams.length} teams for match making`);
    
    if (teams.length < 2) {
      throw new Error('Need at least 2 teams to generate matches');
    }
    
    // Clear existing matches for this tournament first
    console.log('🗑️ Clearing existing matches...');
    await resetTournamentMatches(tournamentId);
    
    // Shuffle teams for random bracket
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    console.log('🔀 Teams shuffled for random bracket');
    
    // Generate bracket
    const matches = generateBracket(shuffledTeams, tournamentId);
    
    // Save matches to Firebase
    console.log(`💾 Generated ${matches.length} matches, saving to Firebase...`);
    await updateMatches(matches);
    
    // Update tournament status
    const { getTournaments, updateTournament } = await import('./firebase-database');
    const tournaments = await getTournaments();
    const currentTournament = tournaments.find(t => t.id === tournamentId || t.name?.toLowerCase().replace(/\s+/g, '-') === tournamentId);
    
    if (currentTournament) {
      const updateId = currentTournament.id || tournamentId;
      await updateTournament(updateId, {
        ...currentTournament,
        status: 'matches_generated',
        totalTeams: teams.length,
        bracketSize: getBracketSize(teams.length),
        bracketGenerated: true
      });
    }
    
    console.log(`✅ Successfully generated and saved ${matches.length} matches to Firebase`);
    
    return {
      matches,
      tournamentId,
      totalTeams: teams.length,
      bracketGenerated: true
    };
    
  } catch (error) {
    console.error('❌ Error generating tournament matches:', error);
    throw error;
  }
}

function generateBracket(teams: Team[], tournamentId: string): Match[] {
  const teamCount = teams.length;
  const bracketSize = getBracketSize(teamCount);
  const matches: Match[] = [];
  
  console.log(`🏗️ Generating ${bracketSize}-team bracket from ${teamCount} teams`);
  
  // Generate Round of 16 (or first round based on team count)
  const firstRoundMatches = Math.min(bracketSize / 2, teamCount);
  const roundNames = getRoundNames(bracketSize);
  
  // Generate first round matches
  let matchIdCounter = 1;
  for (let i = 0; i < firstRoundMatches; i++) {
    const team1Index = i * 2;
    const team2Index = i * 2 + 1;
    const player1 = teams[team1Index] ? teams[team1Index].name : 'BYE';
    const player2 = teams[team2Index] ? teams[team2Index].name : 'BYE';
    
    console.log(`📝 Match ${matchIdCounter}: team1Index=${team1Index}, team2Index=${team2Index}`);
    console.log(`📝 Match ${matchIdCounter}: player1="${player1}", player2="${player2}"`);
    console.log(`📝 Available teams: ${teams.length}, teams:`, teams.map(t => t.name));
    
    // Prevent same team vs same team
    if (player1 === player2 && player1 !== 'BYE') {
      console.warn(`⚠️ Same team assigned to both slots in match ${matchIdCounter}: ${player1} vs ${player2}`);
      // Try to find a different team for player2
      let foundDifferentTeam = false;
      for (let j = 0; j < teams.length; j++) {
        if (teams[j].name !== player1 && !matches.some(m => m.player1 === teams[j].name || m.player2 === teams[j].name)) {
          console.log(`🔄 Replacing player2 with: ${teams[j].name}`);
          const newPlayer2 = teams[j].name;
          matches.push({
            id: `${tournamentId}-match-${matchIdCounter++}`,
            tournamentId,
            round: roundNames[0],
            player1,
            player2: newPlayer2,
            status: 'upcoming',
            result: null,
            scheduledTime: getNextMatchTime(matchIdCounter - 1)
          });
          foundDifferentTeam = true;
          break;
        }
      }
      if (!foundDifferentTeam) {
        console.log(`🔄 No different team found, using TBD for player2`);
        matches.push({
          id: `${tournamentId}-match-${matchIdCounter++}`,
          tournamentId,
          round: roundNames[0],
          player1,
          player2: 'TBD',
          status: 'upcoming',
          result: null,
          scheduledTime: getNextMatchTime(matchIdCounter - 1)
        });
      }
    } else {
      matches.push({
        id: `${tournamentId}-match-${matchIdCounter++}`,
        tournamentId,
        round: roundNames[0],
        player1,
        player2,
        status: player1 === 'BYE' || player2 === 'BYE' ? 'completed' : 'upcoming',
        result: player1 === 'BYE' ? player2 : player2 === 'BYE' ? player1 : null,
        scheduledTime: getNextMatchTime(matchIdCounter - 1)
      });
    }
  }
  
  // Generate subsequent rounds
  for (let round = 1; round < roundNames.length; round++) {
    const matchesInRound = Math.pow(2, roundNames.length - round - 1);
    
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: `${tournamentId}-match-${matchIdCounter++}`,
        tournamentId,
        round: roundNames[round],
        player1: 'TBD',
        player2: 'TBD',
        status: 'upcoming',
        result: null,
        scheduledTime: getNextMatchTime(matchIdCounter - 1)
      });
    }
  }
  
  return matches;
}

function getBracketSize(teamCount: number): number {
  // Find next power of 2
  let size = 2;
  while (size < teamCount) {
    size *= 2;
  }
  return size;
}

function getRoundNames(bracketSize: number): string[] {
  switch (bracketSize) {
    case 2:
      return ['Finals'];
    case 4:
      return ['Semifinals', 'Finals'];
    case 8:
      return ['Quarterfinals', 'Semifinals', 'Finals'];
    case 16:
      return ['Round of 16', 'Quarterfinals', 'Semifinals', 'Finals'];
    case 32:
      return ['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Finals'];
    default:
      return ['Round of 64', 'Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Finals'];
  }
}

function getNextMatchTime(matchIndex: number): string {
  // Schedule matches 30 minutes apart, starting from current time
  const now = new Date();
  const matchTime = new Date(now.getTime() + (matchIndex * 30 * 60 * 1000));
  return matchTime.toISOString();
}

export async function checkAndGenerateMatches(tournamentId: string): Promise<boolean> {
  try {
    const tournament = await getTournament(tournamentId);
    if (!tournament) {
      return false;
    }
    
    // Check if registration is closed and matches haven't been generated
    if (tournament.status === 'closed' && !tournament.matchesGenerated) {
      console.log('🎯 Registration closed, but matches must be generated manually by admin.');
      return false; // Don't auto-generate
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error checking match generation:', error);
    return false;
  }
}
