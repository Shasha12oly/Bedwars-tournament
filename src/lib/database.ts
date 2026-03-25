// Browser-compatible database using LocalStorage
// For static sites, this provides persistent storage in the browser

// Browser storage keys
const TEAMS_STORAGE_KEY = 'tournament_teams_1';
const MATCHES_STORAGE_KEY = 'tournament_matches';

// Types
export interface Team {
  id: string;
  name: string;
  captain: string;
  members: string[];
  discord: string;
  rewardReceiver?: string;
  status: 'confirmed' | 'pending';
  tournamentId: string;
  registeredAt: string;
}

export interface Match {
  id: string;
  round: string;
  player1: string;
  player2: string;
  status: 'upcoming' | 'live' | 'completed';
  result?: string;
  scheduledTime: string;
}

export interface Tournament {
  id: string;
  name: string;
  format: 'Solo' | 'Duo' | 'rbw 4v4';
  date: string;
  time: string;
  maxSlots: number;
  status: 'open' | 'closed' | 'ongoing' | 'completed';
  prize: string;
  description: string;
  rules: string[];
  schedule: { time: string; event: string }[];
  slots?: number;
  registered?: number;
  winner?: string;
}

// Database class
class BrowserDatabase {
  private teams: Team[] = [];
  private matches: Match[] = [];
  private tournaments: Tournament[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      // Load teams from localStorage
      const teamsData = localStorage.getItem(TEAMS_STORAGE_KEY);
      if (teamsData) {
        this.teams = JSON.parse(teamsData);
      } else {
        this.teams = [];
        this.saveTeams();
      }

      // Load matches from localStorage
      const matchesData = localStorage.getItem(MATCHES_STORAGE_KEY);
      if (matchesData) {
        this.matches = JSON.parse(matchesData);
      } else {
        this.matches = this.getDefaultMatches();
        this.saveMatches();
      }

      // Set tournaments (static data)
      this.tournaments = this.getDefaultTournaments();
    } catch (error) {
      console.error('Error loading database:', error);
    }
  }

  private getDefaultMatches(): Match[] {
    return [
      // Round of 16 - 8 matches (16 teams total)
      { id: 'r16-1', round: 'Round of 16', player1: 'Team A', player2: 'Team B', status: 'upcoming', scheduledTime: '2:00 PM' },
      { id: 'r16-2', round: 'Round of 16', player1: 'Team C', player2: 'Team D', status: 'upcoming', scheduledTime: '2:15 PM' },
      { id: 'r16-3', round: 'Round of 16', player1: 'Team E', player2: 'Team F', status: 'upcoming', scheduledTime: '2:30 PM' },
      { id: 'r16-4', round: 'Round of 16', player1: 'Team G', player2: 'Team H', status: 'upcoming', scheduledTime: '2:45 PM' },
      { id: 'r16-5', round: 'Round of 16', player1: 'Team I', player2: 'Team J', status: 'upcoming', scheduledTime: '3:00 PM' },
      { id: 'r16-6', round: 'Round of 16', player1: 'Team K', player2: 'Team L', status: 'upcoming', scheduledTime: '3:15 PM' },
      { id: 'r16-7', round: 'Round of 16', player1: 'Team M', player2: 'Team N', status: 'upcoming', scheduledTime: '3:30 PM' },
      { id: 'r16-8', round: 'Round of 16', player1: 'Team O', player2: 'Team P', status: 'upcoming', scheduledTime: '3:45 PM' },
      
      // Quarterfinals - 4 matches (8 teams)
      { id: 'qf-1', round: 'Quarterfinals', player1: 'TBD', player2: 'TBD', status: 'upcoming', scheduledTime: '4:15 PM' },
      { id: 'qf-2', round: 'Quarterfinals', player1: 'TBD', player2: 'TBD', status: 'upcoming', scheduledTime: '4:30 PM' },
      { id: 'qf-3', round: 'Quarterfinals', player1: 'TBD', player2: 'TBD', status: 'upcoming', scheduledTime: '4:45 PM' },
      { id: 'qf-4', round: 'Quarterfinals', player1: 'TBD', player2: 'TBD', status: 'upcoming', scheduledTime: '5:00 PM' },
      
      // Semifinals - 2 matches (4 teams)
      { id: 'sf-1', round: 'Semifinals', player1: 'TBD', player2: 'TBD', status: 'upcoming', scheduledTime: '6:30 PM' },
      { id: 'sf-2', round: 'Semifinals', player1: 'TBD', player2: 'TBD', status: 'upcoming', scheduledTime: '7:00 PM' },
      
      // Final - 1 match (2 teams)
      { id: 'final', round: 'Final', player1: 'TBD', player2: 'TBD', status: 'upcoming', scheduledTime: '8:30 PM' }
    ];
  }

  private getDefaultTournaments(): Tournament[] {
    return [
      {
        id: '1',
        name: 'Blood Rush BedWars',
        format: 'rbw 4v4',
        date: '2026-03-29',
        time: '2:00 PM - 9:00 PM',
        maxSlots: 16,
        status: 'open',
        prize: 'Hero Rank in MCFleet (for reward receiver) | VIP+ in Hellcore (for reward receiver) | Special Discord role for all team members',
        description: 'Assemble your ultimate squad of 4 players and compete in this intense BedWars tournament. Strategy, teamwork, and skill will determine who emerges victorious.',
        rules: [
          '✅ Ladders',
          '✅ Sponges', 
          '✅ Diamond Sword',
          '✅ Blue Side Base', 
          '✅ Fireballs — No Fireballs at Diamond Tier 1',
          '✅ Water — Use only within your own base',
          '✅ Diamond Armor — Maximum: 2 players per team',
          '✅ Bridge Eggs — Allowed',
          '✅ Emerald Blocks — Allowed',
          '✅ Gold Blocks — Allowed',
          '✅ Iron Blocks — Allowed',
          '✅ Wool — Allowed for bridging',
          '✅ Beds — Must protect your bed',
          '✅ PvP — Combat is allowed',
          '⛔ No hacking or cheating',
          '⛔ No teaming with other teams',
          '⛔ No excessive camping'
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

  private saveTeams() {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(this.teams));
  }

  private saveMatches() {
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(this.matches));
  }

  // Tournament operations
  async getTournaments(): Promise<Tournament[]> {
    return this.tournaments;
  }

  async getTournament(id: string): Promise<Tournament | null> {
    return this.tournaments.find(t => t.id === id) || null;
  }

  // Team operations
  async getTeams(tournamentId: string): Promise<Team[]> {
    return this.teams.filter(team => team.tournamentId === tournamentId);
  }

  async getTeamCount(tournamentId: string): Promise<number> {
    return this.teams.filter(team => team.tournamentId === tournamentId).length;
  }

  async registerTeam(teamData: {
    name: string;
    captain: string;
    members: string[];
    discord: string;
    rewardReceiver?: string;
  }, tournamentId: string): Promise<Team> {
    const teams = await this.getTeams(tournamentId);
    
    // Check if team name already exists
    if (teams.some(t => t.name.toLowerCase() === teamData.name.toLowerCase())) {
      throw new Error('Team name already exists');
    }

    // Check if tournament is full
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (teams.length >= tournament.maxSlots) {
      throw new Error('Tournament is full');
    }

    const newTeam: Team = {
      ...teamData,
      status: 'confirmed',
      tournamentId,
      id: Date.now().toString(),
      registeredAt: new Date().toISOString()
    };

    this.teams.push(newTeam);
    this.saveTeams();
    
    return newTeam;
  }

  // Match operations
  async getMatches(): Promise<Match[]> {
    return this.matches;
  }

  async updateMatches(matches: Match[]): Promise<void> {
    this.matches = matches;
    this.saveMatches();
  }

  // Admin operations
  async resetTournament(tournamentId: string): Promise<void> {
    this.teams = this.teams.filter(team => team.tournamentId !== tournamentId);
    this.matches = this.getDefaultMatches();
    this.saveTeams();
    this.saveMatches();
  }

  async fillSampleData(tournamentId: string): Promise<void> {
    const teamNames = [
      'Swift Warriors', 'Thunder Legends', 'Shadow Champions', 'Crystal Masters',
      'Phoenix Heroes', 'Dragon Titans', 'Storm Destroyers', 'Blaze Conquerors',
      'Frost Guardians', 'Iron Knights', 'Steel Warriors', 'Golden Heroes',
      'Silver Legends', 'Mystic Champions', 'Cosmic Warriors', 'Neon Titans'
    ];

    const sampleTeams: Team[] = teamNames.map((name, index) => ({
      id: `team-${index + 1}`,
      name,
      captain: `Player${index + 1}`,
      members: [`Player${index + 1}`, `Player${index + 2}`, `Player${index + 3}`],
      discord: `user${index + 1}#${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
      rewardReceiver: `Player${index + 1}`,
      status: 'confirmed' as const,
      tournamentId,
      registeredAt: new Date().toISOString()
    }));

    this.teams = sampleTeams;
    this.saveTeams();

    // Update matches with team names
    const updatedMatches = this.matches.map((match, index) => {
      if (match.round === 'Round of 16') {
        const teamIndex = index * 2;
        return {
          ...match,
          player1: teamNames[teamIndex],
          player2: teamNames[teamIndex + 1]
        };
      }
      return match;
    });

    this.matches = updatedMatches;
    this.saveMatches();
  }
}

// Singleton instance
let dbInstance: BrowserDatabase | null = null;

export function getDatabase(): BrowserDatabase {
  if (!dbInstance) {
    dbInstance = new BrowserDatabase();
  }
  return dbInstance;
}

// Export database functions for compatibility
export const getTournaments = () => getDatabase().getTournaments();
export const getTournament = (id: string) => getDatabase().getTournament(id);
export const getTeams = (tournamentId: string) => getDatabase().getTeams(tournamentId);
export const getTeamCount = (tournamentId: string) => getDatabase().getTeamCount(tournamentId);
export const registerTeam = (teamData: any, tournamentId: string) => getDatabase().registerTeam(teamData, tournamentId);
export const getMatches = () => getDatabase().getMatches();
export const updateMatches = (matches: any[]) => getDatabase().updateMatches(matches);
