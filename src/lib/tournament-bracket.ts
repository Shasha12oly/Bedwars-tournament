export interface Match {
  id: string;
  tournamentId: string;
  round: string;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  winnerId?: string;
  winnerName?: string;
  matchTime: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  bracketPosition?: number;
}

export interface TournamentBracket {
  rounds: {
    name: string;
    matches: Match[];
  }[];
}

// Generate tournament bracket for 4v4 tournament (16 teams)
export function generateTournamentBracket(teams: any[], tournamentId: string): TournamentBracket {
  const bracket: TournamentBracket = {
    rounds: []
  };

  // Round of 16
  const roundOf16Teams = [...teams];
  const roundOf16Matches: Match[] = [];
  
  for (let i = 0; i < roundOf16Teams.length; i += 2) {
    if (i + 1 < roundOf16Teams.length) {
      roundOf16Matches.push({
        id: `r16_${Math.floor(i / 2) + 1}`,
        tournamentId,
        round: 'Round of 16',
        team1Id: roundOf16Teams[i].id,
        team2Id: roundOf16Teams[i + 1].id,
        team1Name: roundOf16Teams[i].name,
        team2Name: roundOf16Teams[i + 1].name,
        matchTime: '2:30 PM',
        status: 'scheduled',
        bracketPosition: Math.floor(i / 2) + 1
      });
    }
  }
  
  bracket.rounds.push({
    name: 'Round of 16',
    matches: roundOf16Matches
  });

  // Quarterfinals (4 matches)
  const quarterfinalsMatches: Match[] = [];
  for (let i = 0; i < 4; i++) {
    quarterfinalsMatches.push({
      id: `qf_${i + 1}`,
      tournamentId,
      round: 'Quarterfinals',
      team1Id: '',
      team2Id: '',
      team1Name: 'TBD',
      team2Name: 'TBD',
      matchTime: '4:15 PM',
      status: 'scheduled',
      bracketPosition: i + 1
    });
  }
  
  bracket.rounds.push({
    name: 'Quarterfinals',
    matches: quarterfinalsMatches
  });

  // Semifinals (2 matches)
  const semifinalsMatches: Match[] = [];
  for (let i = 0; i < 2; i++) {
    semifinalsMatches.push({
      id: `sf_${i + 1}`,
      tournamentId,
      round: 'Semifinals',
      team1Id: '',
      team2Id: '',
      team1Name: 'TBD',
      team2Name: 'TBD',
      matchTime: '6:30 PM',
      status: 'scheduled',
      bracketPosition: i + 1
    });
  }
  
  bracket.rounds.push({
    name: 'Semifinals',
    matches: semifinalsMatches
  });

  // Finals (2 teams)
  const finalsMatch: Match = {
    id: 'final_1',
    tournamentId,
    round: 'Finals',
    team1Id: '',
    team2Id: '',
    team1Name: 'TBD',
    team2Name: 'TBD',
    matchTime: '8:30 PM',
    status: 'scheduled',
    bracketPosition: 1
  };
  
  bracket.rounds.push({
    name: 'Finals',
    matches: [finalsMatch]
  });

  return bracket;
}

// Update bracket with winners
export function updateBracketWithWinner(bracket: TournamentBracket, matchId: string, winnerId: string, winnerName: string): TournamentBracket {
  const updatedBracket = JSON.parse(JSON.stringify(bracket));
  
  // Find and update the match
  for (const round of updatedBracket.rounds) {
    const match = round.matches.find(m => m.id === matchId);
    if (match) {
      match.winnerId = winnerId;
      match.winnerName = winnerName;
      match.status = 'completed';
      break;
    }
  }
  
  // Update next round matches
  updateNextRoundMatches(updatedBracket, matchId, winnerId, winnerName);
  
  return updatedBracket;
}

function updateNextRoundMatches(bracket: TournamentBracket, completedMatchId: string, winnerId: string, winnerName: string) {
  const currentRoundIndex = bracket.rounds.findIndex(round => 
    round.matches.some(match => match.id === completedMatchId)
  );
  
  if (currentRoundIndex === -1 || currentRoundIndex === bracket.rounds.length - 1) {
    return; // No next round or this was the final
  }
  
  const currentRound = bracket.rounds[currentRoundIndex];
  const completedMatch = currentRound.matches.find(m => m.id === completedMatchId);
  const nextRound = bracket.rounds[currentRoundIndex + 1];
  
  // Determine which position in next round this winner goes to
  const nextRoundPosition = Math.ceil(completedMatch.bracketPosition! / 2);
  const nextMatch = nextRound.matches.find(m => m.bracketPosition === nextRoundPosition);
  
  if (nextMatch) {
    if (completedMatch.bracketPosition! % 2 === 1) {
      // Winner goes to team1 slot
      nextMatch.team1Id = winnerId;
      nextMatch.team1Name = winnerName;
    } else {
      // Winner goes to team2 slot
      nextMatch.team2Id = winnerId;
      nextMatch.team2Name = winnerName;
    }
  }
}

// Check if tournament is complete
export function isTournamentComplete(bracket: TournamentBracket): boolean {
  const finalRound = bracket.rounds[bracket.rounds.length - 1];
  return finalRound.matches.every(match => match.status === 'completed');
}

// Get tournament winner
export function getTournamentWinner(bracket: TournamentBracket): string | null {
  const finalRound = bracket.rounds[bracket.rounds.length - 1];
  const finalMatch = finalRound.matches[0];
  return finalMatch.winnerName || null;
}
