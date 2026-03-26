// Discord Bot Integration for Tournament System

export interface Team {
  id: string;
  name: string;
  captain: string;
  members: string[];
  discord: string;
  registeredAt: string;
  status: 'confirmed' | 'pending';
  tournamentId: string;
  rewardReceiver?: string;
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
}

// Database with server-side Discord notification (via /api/discord/register)
class TournamentDatabaseWithBot {
  private static instance: TournamentDatabaseWithBot;
  
  private constructor() {
  }
  
  static getInstance(): TournamentDatabaseWithBot {
    if (!TournamentDatabaseWithBot.instance) {
      TournamentDatabaseWithBot.instance = new TournamentDatabaseWithBot();
    }
    return TournamentDatabaseWithBot.instance;
  }

  // Tournament operations
  async getTournaments(): Promise<Tournament[]> {
    console.log('Bot DB: Getting tournaments');
    
    const tournaments: Tournament[] = [
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
          '✅ Wood Blocks — Allowed',
          '✅ Bed Breaking — Allowed',
          '✅ Bow & Arrow — Allowed',
          '✅ Punching — Allowed',
          '✅ Building — Allowed',
          '',
          'Never Allowed:',
          '💀 Pop-up Towers',
          '💀 Obsidian',
          '💀 Bow & Arrows',
          '💀 Fireballing Diamonds',
          '💀 silver fishes are also allowed and now other rules',
          '',
          'No hacks, mods, macros, auto-clickers, or unfair advantages',
          'No glitch abusing or stream sniping',
          'Only allowed clients/mods as per posted tournament rules',
          '',
          'Team members must remain the same throughout the tournament',
          'One Minecraft account and one Discord per player — no smurfing or shared accounts',
          'Respect all players and staff — toxicity or abuse is not tolerated',
          'Be on time for matches; only registered players are allowed',
          'Admin and staff decisions are final',
          '',
          'Rule break = immediate disqualification'
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

    return tournaments;
  }

  async getTournament(id: string): Promise<Tournament | null> {
    const tournaments = await this.getTournaments();
    return tournaments.find(t => t.id === id) || null;
  }

  // Team operations
  async getTeams(tournamentId: string): Promise<Team[]> {
    const storedTeams = localStorage.getItem(`tournament_teams_${tournamentId}`);
    let teams: Team[] = [];
    
    console.log(`Bot DB: Getting teams for tournament ${tournamentId}`);
    console.log(`Bot DB: Raw localStorage data:`, storedTeams);
    
    if (storedTeams) {
      try {
        teams = JSON.parse(storedTeams);
        console.log(`Bot DB: Parsed ${teams.length} teams from storage`);
      } catch (error) {
        console.error('Error parsing stored teams:', error);
        teams = [];
      }
    } else {
      console.log(`Bot DB: No teams found in localStorage for tournament ${tournamentId}`);
    }
    
    return teams;
  }

  async getTeamCount(tournamentId: string): Promise<number> {
    const teams = await this.getTeams(tournamentId);
    return teams.length;
  }

  async registerTeam(teamData: {
    name: string;
    captain: string;
    members: string[];
    discord: string;
    rewardReceiver?: string;
  }, tournamentId: string): Promise<Team> {
    console.log(`Bot DB: Registering team for tournament ${tournamentId}`);
    
    const teams = await this.getTeams(tournamentId);
    console.log(`Bot DB: Adding team to tournament ${tournamentId}. Current teams:`, teams.length);
    
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

    teams.push(newTeam);
    const storageKey = `tournament_teams_${tournamentId}`;
    localStorage.setItem(storageKey, JSON.stringify(teams));
    
    console.log(`Bot DB: Saved team ${newTeam.name} to ${storageKey}. Total teams:`, teams.length);
    
    // Dispatch custom event to update tournament status in real-time
    window.dispatchEvent(new CustomEvent('tournamentUpdate'));
    
    // Send Discord notification via server API route (keeps bot token off client)
    try {
      if (tournament) {
        await fetch('/api/discord/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            team: newTeam, 
            tournament,
            channelId: '1486293985843482774'
          }),
        });
      }
    } catch (error) {
      console.error('Bot DB: Failed to notify Discord:', error);
    }
    
    return newTeam;
  }

  async getAvailableSlots(tournamentId: string): Promise<number> {
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) return 0;
    
    const teamCount = await this.getTeamCount(tournamentId);
    return tournament.maxSlots - teamCount;
  }

  // Note: Discord bot actions must run server-side. Use API routes for advanced features.
}

// Export singleton and functions
export const botDatabase = TournamentDatabaseWithBot.getInstance();

export const getTournaments = async (): Promise<Tournament[]> => {
  return await botDatabase.getTournaments();
};

export const getTournament = async (id: string): Promise<Tournament | null> => {
  return await botDatabase.getTournament(id);
};

export const getTeams = async (tournamentId: string): Promise<Team[]> => {
  return await botDatabase.getTeams(tournamentId);
};

export const getTeamCount = async (tournamentId: string): Promise<number> => {
  return await botDatabase.getTeamCount(tournamentId);
};

export const registerTeam = async (teamData: {
  name: string;
  captain: string;
  members: string[];
  discord: string;
  rewardReceiver?: string;
}, tournamentId: string): Promise<Team> => {
  return await botDatabase.registerTeam(teamData, tournamentId);
};

export const getAvailableSlots = async (tournamentId: string): Promise<number> => {
  return await botDatabase.getAvailableSlots(tournamentId);
};

// Note: Discord bot actions must run server-side. Use API routes for advanced features.
