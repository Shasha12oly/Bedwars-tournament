import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  deleteField,
  FieldValue
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Team {
  id?: string;
  name: string;
  captain: string;
  members: string[];
  discord: string;
  memberDiscords?: string[]; // Store individual Discord usernames for each member
  rewardReceiver?: string;
  status: 'confirmed' | 'pending' | 'registered' | 'disqualified';
  tournamentId: string;
  registeredAt: string | Timestamp;
  registrationSequence?: number; // Order of registration (1st, 2nd, 3rd, etc.)
  disqualifiedAt?: string | Timestamp; // When the team was disqualified
  disqualificationReason?: string; // Reason for disqualification
  disqualifiedBy?: string; // Admin who disqualified the team
  timePreferences?: {
    preferredDays: string[];
    preferredTimes: string[];
    timezone: string;
    notes?: string;
  };
}

export interface Match {
  id: string;
  tournamentId: string;
  round: string;
  player1: string;
  player2: string;
  status: 'upcoming' | 'generated' | 'live' | 'completed';
  result: string | null;
  scheduledTime: string;
}

export interface Tournament {
  id?: string;
  name: string;
  date: string;
  time: string;
  status: 'open' | 'closed' | 'matches_generated' | 'in_progress' | 'completed';
  format: string;
  maxSlots: number;
  prizePool: string;
  rules: string;
  schedule: string;
  matchesGenerated?: boolean;
  totalTeams?: number;
  bracketSize?: number;
  createdAt?: string | Timestamp;
  winner?: string;
  winnerTeam?: {
    name: string;
    captain: string;
    members: string[];
  };
  completedAt?: string | Timestamp;
  // Admin override fields
  manualStatusOverride?: boolean | FieldValue;
  forceStatus?: boolean | FieldValue;
  adminOverrideActive?: boolean | FieldValue;
  overrideTimestamp?: string | Timestamp | FieldValue;
  overrideReason?: string | FieldValue;
}

// Collections
const TEAMS_COLLECTION = 'teams';
const TOURNAMENTS_COLLECTION = 'tournaments';
const MATCHES_COLLECTION = 'matches';

// Team operations
export async function getTeams(tournamentId?: string): Promise<Team[]> {
  try {
    const teamsRef = collection(db, TEAMS_COLLECTION);
    let q;
    
    if (tournamentId) {
      // Simple query without ordering to avoid index requirement
      q = query(teamsRef, where('tournamentId', '==', tournamentId));
    } else {
      q = query(teamsRef);
    }
    
    const querySnapshot = await getDocs(q);
    const teams = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Team[];
    
    // Sort in JavaScript instead of Firestore to avoid index requirement
    return teams.sort((a, b) => {
      let dateA: Date;
      let dateB: Date;
      
      if (typeof a.registeredAt === 'string') {
        dateA = new Date(a.registeredAt);
      } else if (a.registeredAt instanceof Timestamp) {
        dateA = a.registeredAt.toDate();
      } else {
        dateA = new Date();
      }
      
      if (typeof b.registeredAt === 'string') {
        dateB = new Date(b.registeredAt);
      } else if (b.registeredAt instanceof Timestamp) {
        dateB = b.registeredAt.toDate();
      } else {
        dateB = new Date();
      }
      
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
}

export async function getTeamCount(tournamentId: string): Promise<number> {
  try {
    const teamsRef = collection(db, TEAMS_COLLECTION);
    const q = query(teamsRef, where('tournamentId', '==', tournamentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting team count:', error);
    return 0;
  }
}

export async function getNextRegistrationSequence(tournamentId: string): Promise<number> {
  try {
    const teamsRef = collection(db, TEAMS_COLLECTION);
    const q = query(teamsRef, where('tournamentId', '==', tournamentId));
    const querySnapshot = await getDocs(q);
    
    // Get the highest sequence number from all teams in this tournament
    let maxSequence = 0;
    querySnapshot.forEach(doc => {
      const sequence = doc.data().registrationSequence;
      if (sequence && typeof sequence === 'number' && sequence > maxSequence) {
        maxSequence = sequence;
      }
    });
    
    return maxSequence + 1; // Next sequence number
  } catch (error) {
    console.error('Error getting next registration sequence:', error);
    return 1; // Default to 1 if there's an error
  }
}

export async function registerTeam(teamData: Omit<Team, 'id' | 'registeredAt'>): Promise<Team> {
  try {
    // Check if team name already exists for this tournament
    const existingTeams = await getTeams(teamData.tournamentId);
    const duplicateName = existingTeams.find(t => 
      t.name.toLowerCase() === teamData.name.toLowerCase()
    );
    
    if (duplicateName) {
      throw new Error('Team name already exists for this tournament');
    }

    // Check tournament slots
    const tournament = await getTournament(teamData.tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const currentTeamCount = await getTeamCount(teamData.tournamentId);
    if (currentTeamCount >= tournament.maxSlots) {
      throw new Error('Tournament is full');
    }

    const newTeam = {
      ...teamData,
      registeredAt: Timestamp.now(),
      status: 'registered' as const
    };

    const docRef = await addDoc(collection(db, TEAMS_COLLECTION), newTeam);
    return {
      id: docRef.id,
      ...newTeam
    };
  } catch (error) {
    console.error('Error registering team:', error);
    throw error;
  }
}

export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
  try {
    const teamRef = doc(db, TEAMS_COLLECTION, teamId);
    await updateDoc(teamRef, updates);
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
}

export async function deleteTeam(teamId: string): Promise<void> {
  try {
    const teamRef = doc(db, TEAMS_COLLECTION, teamId);
    await deleteDoc(teamRef);
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
}

// Tournament operations
export async function getTournaments(): Promise<Tournament[]> {
  try {
    const tournamentsRef = collection(db, TOURNAMENTS_COLLECTION);
    const querySnapshot = await getDocs(tournamentsRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Tournament[];
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    throw error;
  }
}

export async function getTournament(id: string): Promise<Tournament | null> {
  try {
    const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, id);
    const tournamentDoc = await getDoc(tournamentRef);
    
    if (tournamentDoc.exists()) {
      return {
        id: tournamentDoc.id,
        ...tournamentDoc.data()
      } as Tournament;
    }
    return null;
  } catch (error) {
    console.error('Error fetching tournament:', error);
    throw error;
  }
}

export async function createTournament(tournamentData: Omit<Tournament, 'id'>): Promise<Tournament> {
  try {
    const docRef = await addDoc(collection(db, TOURNAMENTS_COLLECTION), tournamentData);
    return {
      id: docRef.id,
      ...tournamentData
    };
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
}

export async function updateTournament(id: string, updates: Partial<Tournament>): Promise<void> {
  try {
    const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, id);
    await updateDoc(tournamentRef, updates);
  } catch (error) {
    console.error('Error updating tournament:', error);
    throw error;
  }
}

// Admin operations
export async function resetTournamentMatches(tournamentId: string): Promise<void> {
  try {
    const matchesRef = collection(db, MATCHES_COLLECTION);
    const q = query(matchesRef, where('tournamentId', '==', tournamentId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`🗑️ Deleted ${querySnapshot.docs.length} existing matches for tournament ${tournamentId}`);
  } catch (error) {
    console.error('Error resetting tournament matches:', error);
    throw error;
  }
}

export async function resetTournamentTeams(tournamentId: string): Promise<void> {
  try {
    const teams = await getTeams(tournamentId);
    const deletePromises = teams.map(team => deleteTeam(team.id!));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error resetting tournament teams:', error);
    throw error;
  }
}

// Match operations
export async function getMatches(tournamentId?: string): Promise<Match[]> {
  try {
    const matchesRef = collection(db, MATCHES_COLLECTION);
    let q;
    
    if (tournamentId) {
      q = query(matchesRef, where('tournamentId', '==', tournamentId));
    } else {
      q = query(matchesRef);
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Match[];
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
}

export async function createMatch(match: Omit<Match, 'id'>): Promise<string> {
  try {
    // If match has an ID, use setDoc to preserve it, otherwise use addDoc
    if ('id' in match && match.id) {
      const matchRef = doc(db, MATCHES_COLLECTION, match.id as string);
      await setDoc(matchRef, match);
      return match.id as string;
    } else {
      const matchesRef = collection(db, MATCHES_COLLECTION);
      const docRef = await addDoc(matchesRef, match);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
}

export async function createMatchWithId(match: Match): Promise<void> {
  try {
    const matchRef = doc(db, MATCHES_COLLECTION, match.id);
    await setDoc(matchRef, match);
    console.log(`✅ Created match with custom ID: ${match.id}`);
  } catch (error) {
    console.error('Error creating match with custom ID:', error);
    throw error;
  }
}

export async function updateMatch(matchId: string, matchData: Partial<Match>): Promise<void> {
  try {
    const matchRef = doc(db, MATCHES_COLLECTION, matchId);
    await updateDoc(matchRef, matchData);

    // Check if match is being completed and has a winner
    if (matchData.status === 'completed' && matchData.result) {
      console.log('🏆 Match completed, sending Discord notification...');
      
      // Import the notification function
      const { sendMatchCompletionNotification } = await import('./discord-notifications');
      
      // Get tournament name for the notification
      const tournamentName = 'BedWars Tournament'; // You can make this dynamic
      
      // Send Discord notification
      await sendMatchCompletionNotification(
        { 
          id: matchId, 
          player1: matchData.player1 || '', 
          player2: matchData.player2 || '', 
          winner: matchData.result,
          round: matchData.round || '',
          status: 'completed',
          result: matchData.result,
          scheduledTime: matchData.scheduledTime || '',
          tournamentId: matchData.tournamentId || ''
        } as Match,
        tournamentName
      );
    }
  } catch (error) {
    console.error('Error updating match:', error);
    throw error;
  }
}

export async function deleteMatch(matchId: string): Promise<void> {
  try {
    const matchRef = doc(db, MATCHES_COLLECTION, matchId);
    await deleteDoc(matchRef);
  } catch (error) {
    console.error('Error deleting match:', error);
    throw error;
  }
}

export async function updateMatches(matches: Match[]): Promise<void> {
  try {
    // Delete all existing matches for the tournament
    const existingMatches = await getMatches(matches[0]?.tournamentId);
    const deletePromises = existingMatches.map(match => deleteMatch(match.id));
    await Promise.all(deletePromises);
    
    // Create new matches with custom IDs
    const createPromises = matches.map(match => createMatchWithId(match));
    await Promise.all(createPromises);
    
    console.log(`✅ Created ${matches.length} matches with custom IDs`);
  } catch (error) {
    console.error('Error updating matches:', error);
    throw error;
  }
}

export async function updateTournamentWinner(tournamentId: string, winnerTeamName: string): Promise<void> {
  try {
    // Get the winning team details
    const teams = await getTeams(tournamentId);
    const winningTeam = teams.find(team => team.name === winnerTeamName);
    
    if (!winningTeam) {
      console.error(`Winning team ${winnerTeamName} not found`);
      return;
    }
    
    // Update tournament with winner info
    const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
    await updateDoc(tournamentRef, {
      status: 'completed',
      winner: winnerTeamName,
      winnerTeam: {
        name: winningTeam.name,
        captain: winningTeam.captain,
        members: winningTeam.members
      },
      completedAt: new Date().toISOString()
    });
    
    console.log(`✅ Tournament winner updated: ${winnerTeamName}`);
  } catch (error) {
    console.error('Error updating tournament winner:', error);
    throw error;
  }
}

export async function resetTournamentWinner(tournamentId: string): Promise<void> {
  try {
    // Get current tournament data to check registration status
    const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
    const tournamentDoc = await getDoc(tournamentRef);
    
    if (!tournamentDoc.exists()) {
      console.error(`Tournament ${tournamentId} not found`);
      return;
    }
    
    const tournamentData = tournamentDoc.data();
    const currentTeams = tournamentData?.totalTeams || 0;
    const maxSlots = tournamentData?.maxSlots || 16;
    
    // Determine correct status based on registration
    const newStatus = currentTeams >= maxSlots ? 'closed' : 'open';
    
    // Reset tournament winner and status
    await updateDoc(tournamentRef, {
      status: newStatus,
      winner: deleteField(),
      winnerTeam: deleteField(),
      completedAt: deleteField()
    });
    
    console.log(`✅ Tournament winner reset for tournament: ${tournamentId}`);
    console.log(`✅ Tournament status set to: ${newStatus} (teams: ${currentTeams}/${maxSlots})`);
  } catch (error) {
    console.error('Error resetting tournament winner:', error);
    throw error;
  }
}

export async function updateSingleMatch(matchId: string, updates: Partial<Match>): Promise<void> {
  try {
    const matchRef = doc(db, MATCHES_COLLECTION, matchId);
    
    // First check if the document exists
    const matchDoc = await getDoc(matchRef);
    if (!matchDoc.exists()) {
      console.warn(`⚠️ Match ${matchId} does not exist in database. Skipping update.`);
      return;
    }
    
    // Get the current match data before updating
    const currentMatch = matchDoc.data() as Match;
    
    await updateDoc(matchRef, updates);
    console.log(`✅ Match ${matchId} updated successfully`);

    // Check if match is being completed and has a winner
    if (updates.status === 'completed' && updates.result) {
      console.log('🏆 Match completed, sending Discord notification...');
      
      // Import the notification function
      const { sendMatchCompletionNotification } = await import('./discord-notifications');
      
      // Get tournament name for the notification
      const tournamentName = 'BedWars Tournament'; // You can make this dynamic
      
      // Try to get Discord IDs from team data
      let winnerDiscordId: string | undefined;
      let loserDiscordId: string | undefined;
      
      try {
        // Get teams to find Discord IDs
        const { getTeams } = await import('./firebase-database');
        const teams = await getTeams(currentMatch.tournamentId);
        
        // Find winner team
        const winnerTeam = teams.find(team => team.name === updates.result);
        const loserTeam = teams.find(team => 
          team.name === currentMatch.player1 || team.name === currentMatch.player2
        );
        
        if (winnerTeam?.discord) {
          winnerDiscordId = winnerTeam.discord;
        }
        
        if (loserTeam?.discord && loserTeam.name !== updates.result) {
          loserDiscordId = loserTeam.discord;
        }
        
        console.log(`🔍 Found Discord IDs - Winner: ${winnerDiscordId}, Loser: ${loserDiscordId}`);
      } catch (error) {
        console.warn('⚠️ Could not fetch team Discord IDs:', error);
      }
      
      // Send Discord notification with the updated match data
      await sendMatchCompletionNotification(
        { 
          ...currentMatch,
          ...updates,
          id: matchId
        } as Match,
        tournamentName,
        winnerDiscordId,
        loserDiscordId
      );
    }
  } catch (error) {
    console.error('Error updating match:', error);
    throw error;
  }
}

// Disqualify a team from tournament
export async function disqualifyTeam(
  teamId: string, 
  reason: string, 
  disqualifiedBy: string = 'Admin'
): Promise<void> {
  try {
    const teamRef = doc(db, TEAMS_COLLECTION, teamId);
    
    // Check if team exists
    const teamDoc = await getDoc(teamRef);
    if (!teamDoc.exists()) {
      throw new Error(`Team ${teamId} does not exist`);
    }
    
    const teamData = teamDoc.data();
    if (teamData.status === 'disqualified') {
      console.warn(`⚠️ Team ${teamData.name} is already disqualified`);
      return;
    }
    
    // Update team with disqualification info
    await updateDoc(teamRef, {
      status: 'disqualified',
      disqualifiedAt: new Date(),
      disqualificationReason: reason,
      disqualifiedBy: disqualifiedBy
    });
    
    console.log(`✅ Team ${teamData.name} has been disqualified. Reason: ${reason}`);
  } catch (error) {
    console.error('Error disqualifying team:', error);
    throw error;
  }
}

// Handle disqualification impact on matches
export async function handleDisqualificationImpact(
  tournamentId: string, 
  disqualifiedTeamName: string
): Promise<void> {
  try {
    const matchesRef = collection(db, MATCHES_COLLECTION);
    const q = query(matchesRef, where('tournamentId', '==', tournamentId));
    const querySnapshot = await getDocs(q);
    
    const affectedMatches: string[] = [];
    
    // Find all matches involving the disqualified team
    for (const doc of querySnapshot.docs) {
      const match = doc.data();
      if (match.player1 === disqualifiedTeamName || match.player2 === disqualifiedTeamName) {
        // Determine the winner (the other team)
        const winner = match.player1 === disqualifiedTeamName ? match.player2 : match.player1;
        
        // Update the match with result
        await updateDoc(doc.ref, {
          status: 'completed',
          result: `${winner} (Opponent Disqualified)`,
          completedAt: new Date()
        });
        
        affectedMatches.push(doc.id);
        console.log(`✅ Match ${match.round}: ${match.player1} vs ${match.player2} - Winner: ${winner} (Opponent Disqualified)`);
      }
    }
    
    // Update future matches that depend on these results
    await updateTournamentBracket(tournamentId, disqualifiedTeamName);
    
    console.log(`✅ Disqualification impact handled for ${affectedMatches.length} matches`);
  } catch (error) {
    console.error('Error handling disqualification impact:', error);
    throw error;
  }
}

// Update tournament bracket after disqualification
export async function updateTournamentBracket(
  tournamentId: string, 
  disqualifiedTeamName: string
): Promise<void> {
  try {
    const matchesRef = collection(db, MATCHES_COLLECTION);
    const q = query(matchesRef, where('tournamentId', '==', tournamentId));
    const querySnapshot = await getDocs(q);
    
    // Get all matches and sort by round
    const matches: Match[] = querySnapshot.docs.map(doc => ({
      ...doc.data() as Match,
      id: doc.id
    })).sort((a, b) => {
      // Sort by round order (Round of 64, Round of 32, etc.)
      const roundOrder = ['Round of 64', 'Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Finals'];
      const aIndex = roundOrder.indexOf(a.round);
      const bIndex = roundOrder.indexOf(b.round);
      return aIndex - bIndex;
    });
    
    // Update matches where the disqualified team was supposed to advance
    for (const match of matches) {
      if (match.status === 'upcoming' && 
          (match.player1 === disqualifiedTeamName || match.player2 === disqualifiedTeamName)) {
        
        // Find the winner from previous round that should advance
        const winner = await findAdvancingTeam(tournamentId, match, disqualifiedTeamName);
        
        if (winner) {
          await updateDoc(doc(db, MATCHES_COLLECTION, match.id), {
            player1: match.player1 === disqualifiedTeamName ? winner : match.player1,
            player2: match.player2 === disqualifiedTeamName ? winner : match.player2
          });
          
          console.log(`✅ Updated bracket match ${match.round}: ${match.player1} vs ${match.player2} -> ${winner} advances`);
        }
      }
    }
  } catch (error) {
    console.error('Error updating tournament bracket:', error);
    throw error;
  }
}

// Find the advancing team to replace disqualified team
async function findAdvancingTeam(
  tournamentId: string, 
  currentMatch: Match, 
  disqualifiedTeamName: string
): Promise<string | null> {
  try {
    const matchesRef = collection(db, MATCHES_COLLECTION);
    const q = query(matchesRef, where('tournamentId', '==', tournamentId));
    const querySnapshot = await getDocs(q);
    
    // Find matches from previous rounds that feed into this match
    const previousMatches = querySnapshot.docs
      .map(doc => doc.data() as Match)
      .filter(match => 
        match.status === 'completed' && 
        match.result && 
        match.result.includes(disqualifiedTeamName) === false
      );
    
    // Return the most recent winner that's not the disqualified team
    if (previousMatches.length > 0) {
      const lastMatch = previousMatches[previousMatches.length - 1];
      return lastMatch.result?.split(' ')[0] || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding advancing team:', error);
    return null;
  }
}

// Reinstate a disqualified team
export async function reinstateTeam(teamId: string, reinstatedBy: string = 'Admin'): Promise<void> {
  try {
    const teamRef = doc(db, TEAMS_COLLECTION, teamId);
    
    // Check if team exists
    const teamDoc = await getDoc(teamRef);
    if (!teamDoc.exists()) {
      throw new Error(`Team ${teamId} does not exist`);
    }
    
    const teamData = teamDoc.data();
    if (teamData.status !== 'disqualified') {
      console.warn(`⚠️ Team ${teamData.name} is not disqualified`);
      return;
    }
    
    // Update team to remove disqualification
    await updateDoc(teamRef, {
      status: 'registered',
      disqualifiedAt: deleteField(),
      disqualificationReason: deleteField(),
      disqualifiedBy: deleteField()
    });
    
    console.log(`✅ Team ${teamData.name} has been reinstated`);
  } catch (error) {
    console.error('Error reinstating team:', error);
    throw error;
  }
}

// Generate tournament bracket
export async function generateBracket(tournamentId: string, qualifiedTeams: Team[]): Promise<Match[]> {
  try {
    // Clear existing matches for this tournament
    const matchesRef = collection(db, MATCHES_COLLECTION);
    const q = query(matchesRef, where('tournamentId', '==', tournamentId));
    const querySnapshot = await getDocs(q);
    
    // Delete existing matches
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    const teamNames = qualifiedTeams.map(team => team.name);
    const matches: Match[] = [];
    
    // Determine bracket structure based on number of teams
    const numTeams = teamNames.length;
    let bracketSize = 64;
    
    if (numTeams <= 32) bracketSize = 32;
    if (numTeams <= 16) bracketSize = 16;
    if (numTeams <= 8) bracketSize = 8;
    if (numTeams <= 4) bracketSize = 4;
    
    // Shuffle teams for random placement
    const shuffledTeams = [...teamNames].sort(() => Math.random() - 0.5);
    
    // Fill remaining spots with "TBD" if needed
    while (shuffledTeams.length < bracketSize) {
      shuffledTeams.push('TBD');
    }
    
    // Generate matches based on bracket size
    let currentRoundTeams = shuffledTeams;
    let roundIndex = 0;
    
    const roundNames = {
      64: 'Round of 64',
      32: 'Round of 32',
      16: 'Round of 16',
      8: 'Quarterfinals',
      4: 'Semifinals',
      2: 'Finals'
    };
    
    while (currentRoundTeams.length > 1) {
      const roundSize = currentRoundTeams.length;
      const roundName = roundNames[roundSize as keyof typeof roundNames] || `Round of ${roundSize}`;
      const numMatches = roundSize / 2;
      
      for (let i = 0; i < numMatches; i++) {
        const player1 = currentRoundTeams[i * 2];
        const player2 = currentRoundTeams[i * 2 + 1];
        
        const match: Match = {
          id: `${tournamentId}-${roundName}-${i + 1}`,
          tournamentId,
          round: roundName,
          player1,
          player2,
          status: 'upcoming',
          result: null,
          scheduledTime: `Match ${i + 1}`
        };
        
        matches.push(match);
        await setDoc(doc(matchesRef, match.id), match);
      }
      
      // Prepare next round (winners advance as TBD for now)
      currentRoundTeams = Array(numMatches).fill('TBD');
      roundIndex++;
    }
    
    console.log(`✅ Generated ${matches.length} matches for tournament with ${numTeams} teams`);
    return matches;
  } catch (error) {
    console.error('Error generating bracket:', error);
    throw error;
  }
}
