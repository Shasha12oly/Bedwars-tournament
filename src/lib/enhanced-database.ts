// Enhanced Database System with Discord Integration

export interface Team {
  id: string;
  name: string;
  captain: string;
  members: string[];
  discord: string;
  registeredAt: string;
  status: 'confirmed' | 'pending';
  tournamentId: string;
}

export interface Tournament {
  id: string;
  name: string;
  format: 'Solo' | 'Duo' | 'Squad';
  date: string;
  time: string;
  maxSlots: number;
  status: 'open' | 'closed' | 'ongoing';
  prize: string;
  description: string;
  rules: string[];
  schedule: { time: string; event: string }[];
}

// Discord Webhook Configuration
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';

// Enhanced Database Class
class EnhancedTournamentDatabase {
  private static instance: EnhancedTournamentDatabase;
  
  private constructor() {}
  
  static getInstance(): EnhancedTournamentDatabase {
    if (!EnhancedTournamentDatabase.instance) {
      EnhancedTournamentDatabase.instance = new EnhancedTournamentDatabase();
    }
    return EnhancedTournamentDatabase.instance;
  }

  // Tournament operations
  async getTournaments(): Promise<Tournament[]> {
    console.log('Enhanced DB: Getting tournaments');
    
    const tournaments: Tournament[] = [
      {
        id: '1',
        name: 'Bloosy Squads',
        format: 'Squad',
        date: '2024-03-30',
        time: '6:00 PM',
        maxSlots: 16,
        status: 'open',
        prize: 'To be decided',
        description: 'Assemble your ultimate squad of 4 players and compete in this intense BedWars tournament. Strategy, teamwork, and skill will determine who emerges victorious.',
        rules: [
          'No hacking, mods, or unfair advantages',
          'No teaming with other squads',
          'Be on time for your matches',
          'Respect all players and staff',
          'Follow all server rules',
          'Stream sniping is prohibited',
          'Only allowed clients/mods permitted'
        ],
        schedule: [
          { time: '5:30 PM', event: 'Check-in opens' },
          { time: '6:00 PM', event: 'Tournament begins' },
          { time: '6:15 PM', event: 'Round 1' },
          { time: '6:45 PM', event: 'Round 2' },
          { time: '7:15 PM', event: 'Semi-finals' },
          { time: '7:45 PM', event: 'Finals' },
          { time: '8:15 PM', event: 'Awards ceremony' }
        ]
      }
    ];

    console.log('Enhanced DB: Returning', tournaments.length, 'tournaments');
    return tournaments;
  }

  async getTournament(id: string): Promise<Tournament | null> {
    console.log(`Enhanced DB: Getting tournament ${id}`);
    const tournaments = await this.getTournaments();
    const tournament = tournaments.find(t => t.id === id) || null;
    console.log(`Enhanced DB: Tournament ${id} found:`, !!tournament);
    return tournament;
  }

  // Team operations
  async getTeams(tournamentId: string): Promise<Team[]> {
    console.log(`Enhanced DB: Getting teams for tournament ${tournamentId}`);
    const storedTeams = localStorage.getItem(`tournament_teams_${tournamentId}`);
    let teams: Team[] = [];
    
    if (storedTeams) {
      try {
        teams = JSON.parse(storedTeams);
      } catch (error) {
        console.error('Enhanced DB: Error parsing stored teams:', error);
        teams = [];
      }
    }
    
    console.log(`Enhanced DB: Found ${teams.length} teams for tournament ${tournamentId}`);
    return teams;
  }

  async getTeamCount(tournamentId: string): Promise<number> {
    const teams = await this.getTeams(tournamentId);
    return teams.length;
  }

  async addTeam(teamData: Omit<Team, 'id' | 'registeredAt'>, tournamentId: string): Promise<Team> {
    console.log(`Enhanced DB: Adding team to tournament ${tournamentId}`);
    
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
      id: Date.now().toString(),
      registeredAt: new Date().toISOString()
    };

    teams.push(newTeam);
    localStorage.setItem(`tournament_teams_${tournamentId}`, JSON.stringify(teams));
    
    console.log(`Enhanced DB: Successfully added team ${newTeam.name}`);
    return newTeam;
  }

  async registerTeam(teamData: {
    name: string;
    captain: string;
    members: string[];
    discord: string;
  }, tournamentId: string): Promise<Team> {
    console.log(`Enhanced DB: Registering team for tournament ${tournamentId}`);
    
    const team = await this.addTeam({
      ...teamData,
      status: 'confirmed',
      tournamentId
    }, tournamentId);

    // Send to Discord
    await this.sendToDiscord(team, tournamentId);
    
    return team;
  }

  // Discord Integration
  private async sendToDiscord(team: Team, tournamentId: string): Promise<void> {
    console.log(`Enhanced DB: Sending team ${team.name} to Discord`);
    
    try {
      const tournament = await this.getTournament(tournamentId);
      if (!tournament) return;

      const embed = {
        title: "🎮 New Team Registration!",
        color: 0x00ff00,
        fields: [
          {
            name: "🏆 Tournament",
            value: tournament.name,
            inline: true
          },
          {
            name: "👥 Team Name",
            value: team.name,
            inline: true
          },
          {
            name: "👑 Captain",
            value: team.captain,
            inline: true
          },
          {
            name: "🔗 Discord",
            value: team.discord,
            inline: true
          },
          {
            name: "👪 Members",
            value: team.members.join('\n'),
            inline: false
          },
          {
            name: "📅 Registered At",
            value: new Date(team.registeredAt).toLocaleString(),
            inline: true
          },
          {
            name: "📊 Status",
            value: team.status,
            inline: true
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "BedWars Tournament System"
        }
      };

      // In production, you would send this to your Discord webhook
      console.log('Discord message prepared:', embed);
      
      // Uncomment this when you have a real webhook URL
      // const response = await fetch(DISCORD_WEBHOOK_URL, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     embeds: [embed]
      //   })
      // });
      
      // if (!response.ok) {
      //   console.error('Failed to send to Discord');
      // } else {
      //   console.log('Successfully sent to Discord');
      // }
      
    } catch (error) {
      console.error('Enhanced DB: Error sending to Discord:', error);
    }
  }

  async getAvailableSlots(tournamentId: string): Promise<number> {
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) return 0;
    
    const teamCount = await this.getTeamCount(tournamentId);
    return tournament.maxSlots - teamCount;
  }

  // Database statistics
  async getDatabaseStats(): Promise<any> {
    const tournaments = await this.getTournaments();
    const stats = {
      totalTournaments: tournaments.length,
      totalTeams: 0,
      tournamentsByStatus: {
        open: 0,
        closed: 0,
        ongoing: 0
      }
    };

    for (const tournament of tournaments) {
      const teamCount = await this.getTeamCount(tournament.id);
      stats.totalTeams += teamCount;
      stats.tournamentsByStatus[tournament.status]++;
    }

    return stats;
  }
}

// Export singleton and functions
export const enhancedDatabase = EnhancedTournamentDatabase.getInstance();

export const getTournaments = async (): Promise<Tournament[]> => {
  return await enhancedDatabase.getTournaments();
};

export const getTournament = async (id: string): Promise<Tournament | null> => {
  return await enhancedDatabase.getTournament(id);
};

export const getTeams = async (tournamentId: string): Promise<Team[]> => {
  return await enhancedDatabase.getTeams(tournamentId);
};

export const getTeamCount = async (tournamentId: string): Promise<number> => {
  return await enhancedDatabase.getTeamCount(tournamentId);
};

export const registerTeam = async (teamData: {
  name: string;
  captain: string;
  members: string[];
  discord: string;
}, tournamentId: string): Promise<Team> => {
  return await enhancedDatabase.registerTeam(teamData, tournamentId);
};

export const getAvailableSlots = async (tournamentId: string): Promise<number> => {
  return await enhancedDatabase.getAvailableSlots(tournamentId);
};

export const getDatabaseStats = async (): Promise<any> => {
  return await enhancedDatabase.getDatabaseStats();
};
