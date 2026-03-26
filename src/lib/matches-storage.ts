import fs from 'fs';
import path from 'path';

const MATCHES_FILE = path.join(process.cwd(), 'data', 'matches.json');
const TOURNAMENTS_FILE = path.join(process.cwd(), 'data', 'tournaments.json');

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  round: string;
  player1: string;
  player2: string;
  player1Id?: string;
  player2Id?: string;
  status: 'upcoming' | 'live' | 'completed';
  result?: string;
  winnerId?: string;
  scheduledTime: string;
  scheduledDate: string;
  format: string;
  matchTime?: string;
  bracketPosition?: number;
  score?: string | null;
  streamUrl?: string | null;
  roomId?: string | null;
}

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(MATCHES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read matches from JSON file
export function getMatchesFromStorage(): Match[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(MATCHES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(MATCHES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading matches from storage:', error);
    return [];
  }
}

// Save matches to JSON file
export function saveMatchesToStorage(matches: Match[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(MATCHES_FILE, JSON.stringify(matches, null, 2));
    console.log('✅ Matches saved to JSON file');
  } catch (error) {
    console.error('Error saving matches to storage:', error);
    throw error;
  }
}

// Get matches for a specific tournament
export function getMatchesByTournament(tournamentId: string): Match[] {
  const matches = getMatchesFromStorage();
  return matches.filter(match => match.tournamentId === tournamentId);
}

// Update match status
export function updateMatchStatus(matchId: string, status: 'upcoming' | 'live' | 'completed', result?: string): Match | null {
  const matches = getMatchesFromStorage();
  const matchIndex = matches.findIndex(m => m.id === matchId);
  
  if (matchIndex === -1) {
    console.error('Match not found:', matchId);
    return null;
  }
  
  matches[matchIndex].status = status;
  if (result) {
    matches[matchIndex].result = result;
  }
  matches[matchIndex].matchTime = new Date().toISOString();
  
  saveMatchesToStorage(matches);
  return matches[matchIndex];
}

// Update match players (for winner advancement)
export function updateMatchPlayers(matchId: string, player1: string, player2: string): Match | null {
  const matches = getMatchesFromStorage();
  const matchIndex = matches.findIndex(m => m.id === matchId);
  
  if (matchIndex === -1) {
    console.error('Match not found:', matchId);
    return null;
  }
  
  matches[matchIndex].player1 = player1;
  matches[matchIndex].player2 = player2;
  matches[matchIndex].matchTime = new Date().toISOString();
  
  saveMatchesToStorage(matches);
  return matches[matchIndex];
}

// Generate tournament bracket
export async function generateTournamentBracket(tournamentId: string, tournamentName: string): Promise<Match[]> {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Import here to avoid circular dependencies
  const { getTeamsFromDatabase } = await import('./tournament-storage');
  
  // Get actual team names from database
  const teams = await getTeamsFromDatabase(tournamentId);
  console.log(`🔍 Found ${teams.length} teams for tournament ${tournamentId}`);

  // Create team name mapping
  const teamNames: string[] = [];
  for (let i = 0; i < 16; i++) {
    if (i < teams.length) {
      teamNames.push(teams[i].name || `Team ${i + 1}`);
    } else {
      teamNames.push(`Team ${i + 1}`);
    }
  }

  const bracketData = [
    // Round of 16 - 8 matches
    { round: 'Round of 16', player1: teamNames[0], player2: teamNames[1], time: '2:00 PM', position: 1 },
    { round: 'Round of 16', player1: teamNames[2], player2: teamNames[3], time: '2:15 PM', position: 2 },
    { round: 'Round of 16', player1: teamNames[4], player2: teamNames[5], time: '2:30 PM', position: 3 },
    { round: 'Round of 16', player1: teamNames[6], player2: teamNames[7], time: '2:45 PM', position: 4 },
    { round: 'Round of 16', player1: teamNames[8], player2: teamNames[9], time: '3:00 PM', position: 5 },
    { round: 'Round of 16', player1: teamNames[10], player2: teamNames[11], time: '3:15 PM', position: 6 },
    { round: 'Round of 16', player1: teamNames[12], player2: teamNames[13], time: '3:30 PM', position: 7 },
    { round: 'Round of 16', player1: teamNames[14], player2: teamNames[15], time: '3:45 PM', position: 8 },
    // Quarterfinals - 4 matches
    { round: 'Quarterfinals', player1: 'Winner of Match 1', player2: 'Winner of Match 2', time: '4:15 PM', position: 9 },
    { round: 'Quarterfinals', player1: 'Winner of Match 3', player2: 'Winner of Match 4', time: '4:30 PM', position: 10 },
    { round: 'Quarterfinals', player1: 'Winner of Match 5', player2: 'Winner of Match 6', time: '4:45 PM', position: 11 },
    { round: 'Quarterfinals', player1: 'Winner of Match 7', player2: 'Winner of Match 8', time: '5:00 PM', position: 12 },
    // Semifinals - 2 matches
    { round: 'Semifinals', player1: 'Winner of QF 1', player2: 'Winner of QF 2', time: '6:30 PM', position: 13 },
    { round: 'Semifinals', player1: 'Winner of QF 3', player2: 'Winner of QF 4', time: '7:00 PM', position: 14 },
    // Final - 1 match
    { round: 'Final', player1: 'Winner of SF 1', player2: 'Winner of SF 2', time: '8:30 PM', position: 15 }
  ];

  const matches: Match[] = bracketData.map(matchData => ({
    id: matchData.round.toLowerCase().replace(' ', '-') + '-' + matchData.position,
    tournamentId,
    tournamentName,
    round: matchData.round,
    player1: matchData.player1,
    player2: matchData.player2,
    player1Id: '',
    player2Id: '',
    status: 'upcoming' as const,
    result: undefined,
    winnerId: '',
    scheduledTime: matchData.time,
    scheduledDate: today,
    format: 'rbw 4v4',
    matchTime: new Date().toISOString(),
    bracketPosition: matchData.position,
    score: null,
    streamUrl: null,
    roomId: null
  }));

  saveMatchesToStorage(matches);
  console.log(`✅ Generated ${matches.length} matches for tournament`);
  return matches;
}

// Get all matches (for API compatibility)
export function getAllMatches(tournamentId?: string): Match[] {
  const matches = getMatchesFromStorage();
  if (tournamentId) {
    return matches.filter(match => match.tournamentId === tournamentId);
  }
  return matches;
}

// Delete all matches for a tournament
export function deleteAllMatches(tournamentId: string): void {
  const matches = getMatchesFromStorage();
  const filteredMatches = matches.filter(match => match.tournamentId !== tournamentId);
  saveMatchesToStorage(filteredMatches);
  console.log(`✅ Deleted all matches for tournament ${tournamentId}`);
}
