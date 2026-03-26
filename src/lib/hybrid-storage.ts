// Fallback storage system that switches between Discord and LocalStorage
import { 
  getTeamsFromDiscord, 
  saveTeamsToDiscord, 
  getTournamentsFromDiscord, 
  saveTournamentsToDiscord,
  getMatchesFromDiscord,
  saveMatchesToDiscord,
  testDiscordConnection 
} from './discord-storage';

// Fallback to LocalStorage functions
const TEAMS_STORAGE_KEY = 'tournament_teams_fallback';
const TOURNAMENTS_STORAGE_KEY = 'tournament_tournaments_fallback';
const MATCHES_STORAGE_KEY = 'tournament_matches_fallback';

// LocalStorage fallback functions
function getFromLocalStorage(key: string): any[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
}

function saveToLocalStorage(key: string, data: any[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
}

// Hybrid storage functions with automatic fallback
export async function getTeamsHybrid(): Promise<any[]> {
  try {
    // Try Discord first
    const isConnected = await testDiscordConnection();
    if (isConnected) {
      const teams = await getTeamsFromDiscord();
      return teams;
    }
  } catch (error) {
    console.warn('Discord storage failed for teams, falling back to localStorage:', error);
  }
  
  // Fallback to localStorage
  return getFromLocalStorage(TEAMS_STORAGE_KEY);
}

export async function saveTeamsHybrid(teams: any[]): Promise<boolean> {
  try {
    // Try Discord first
    const isConnected = await testDiscordConnection();
    if (isConnected) {
      const saved = await saveTeamsToDiscord(teams);
      if (saved) {
        // Also save to localStorage as backup
        saveToLocalStorage(TEAMS_STORAGE_KEY, teams);
        return true;
      }
    }
  } catch (error) {
    console.warn('Discord storage failed for teams, falling back to localStorage:', error);
  }
  
  // Fallback to localStorage
  return saveToLocalStorage(TEAMS_STORAGE_KEY, teams);
}

export async function getTournamentsHybrid(): Promise<any[]> {
  try {
    // Try Discord first
    const isConnected = await testDiscordConnection();
    if (isConnected) {
      const tournaments = await getTournamentsFromDiscord();
      return tournaments;
    }
  } catch (error) {
    console.warn('Discord storage failed for tournaments, falling back to localStorage:', error);
  }
  
  // Fallback to localStorage with default data
  const tournaments = getFromLocalStorage(TOURNAMENTS_STORAGE_KEY);
  if (tournaments.length === 0) {
    return [
      {
        id: '1',
        name: 'Blood Rush BedWars',
        date: 'March 29, 2026',
        time: '2:00 PM - 9:00 PM',
        status: 'upcoming',
        format: 'rbw 4v4',
        maxSlots: 16,
        currentTeams: 0,
        prizePool: '₹2000',
        rules: [
          'No cheating, hacking, or exploiting bugs',
          'Respect all players and staff',
          'Be on time for matches',
          'Follow Discord server rules',
          'Admin decisions are final'
        ],
        schedule: [
          { time: '2:00 PM', event: 'Registration closes' },
          { time: '2:15 PM', event: 'Tournament begins' },
          { time: '2:30 PM', event: 'Round of 16 starts' },
          { time: '4:15 PM', event: 'Quarterfinals' },
          { time: '6:30 PM', event: 'Semifinals' },
          { time: '8:30 PM', event: 'Finals' },
          { time: '9:00 PM', event: 'Awards ceremony' }
        ]
      }
    ];
  }
  
  return tournaments;
}

export async function saveTournamentsHybrid(tournaments: any[]): Promise<boolean> {
  try {
    // Try Discord first
    const isConnected = await testDiscordConnection();
    if (isConnected) {
      const saved = await saveTournamentsToDiscord(tournaments);
      if (saved) {
        // Also save to localStorage as backup
        saveToLocalStorage(TOURNAMENTS_STORAGE_KEY, tournaments);
        return true;
      }
    }
  } catch (error) {
    console.warn('Discord storage failed for tournaments, falling back to localStorage:', error);
  }
  
  // Fallback to localStorage
  return saveToLocalStorage(TOURNAMENTS_STORAGE_KEY, tournaments);
}

export async function getMatchesHybrid(): Promise<any[]> {
  try {
    // Try Discord first
    const isConnected = await testDiscordConnection();
    if (isConnected) {
      const matches = await getMatchesFromDiscord();
      return matches;
    }
  } catch (error) {
    console.warn('Discord storage failed for matches, falling back to localStorage:', error);
  }
  
  // Fallback to localStorage
  return getFromLocalStorage(MATCHES_STORAGE_KEY);
}

export async function saveMatchesHybrid(matches: any[]): Promise<boolean> {
  try {
    // Try Discord first
    const isConnected = await testDiscordConnection();
    if (isConnected) {
      const saved = await saveMatchesToDiscord(matches);
      if (saved) {
        // Also save to localStorage as backup
        saveToLocalStorage(MATCHES_STORAGE_KEY, matches);
        return true;
      }
    }
  } catch (error) {
    console.warn('Discord storage failed for matches, falling back to localStorage:', error);
  }
  
  // Fallback to localStorage
  return saveToLocalStorage(MATCHES_STORAGE_KEY, matches);
}

export async function getTeamCountHybrid(tournamentId: string): Promise<number> {
  const teams = await getTeamsHybrid();
  return teams.filter((team: any) => team.tournamentId === tournamentId).length;
}

// Storage status check
export async function getStorageStatus(): Promise<{
  discord: boolean;
  localStorage: boolean;
  active: 'discord' | 'localStorage';
}> {
  let discordConnected = false;
  
  try {
    discordConnected = await testDiscordConnection();
  } catch (error) {
    discordConnected = false;
  }
  
  let localStorageWorking = false;
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    localStorageWorking = true;
  } catch (error) {
    localStorageWorking = false;
  }
  
  return {
    discord: discordConnected,
    localStorage: localStorageWorking,
    active: discordConnected ? 'discord' : 'localStorage'
  };
}
