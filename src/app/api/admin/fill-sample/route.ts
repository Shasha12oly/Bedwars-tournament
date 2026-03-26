import { NextResponse } from 'next/server';
import { 
  saveTeamToDatabase,
  saveMatchToDatabase,
  updateTournamentStatus,
  getTeamsFromDatabase
} from '@/lib/tournament-storage';

export async function POST() {
  try {
    // Check if tournament already has teams
    const existingTeams = await getTeamsFromDatabase('1');
    if (existingTeams.length >= 16) {
      return NextResponse.json({ 
        error: 'Tournament is already full (16/16 teams). Reset first if you want to fill with new sample data.' 
      }, { status: 400 });
    }

    // Generate random teams
    const adjectives = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Sigma', 'Tau', 'Phi', 'Psi', 'Chi', 'Theta', 'Lambda', 'Mu', 'Nu', 'Xi', 'Rho'];
    const nouns = ['Warriors', 'Titans', 'Legends', 'Champions', 'Masters', 'Guardians', 'Phantoms', 'Vipers', 'Eagles', 'Lions', 'Tigers', 'Dragons', 'Phoenix', 'Raptors', 'Sharks', 'Wolves'];
    
    const sampleTeams = [];
    for (let i = 0; i < 16; i++) {
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const teamName = `${adjective} ${noun}`;
      
      const team = {
        id: `team-${Date.now()}-${i}`,
        tournamentId: '1',
        name: teamName,
        captain: `Player${i + 1}`,
        members: [`Player${i + 1}`, `Player${i + 2}`, `Player${i + 3}`],
        discordUsers: [`user${i + 1}#${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`],
        rewardReceiver: `Player${i + 1}`,
        registeredAt: new Date().toISOString(),
        status: 'registered'
      };
      
      sampleTeams.push(team);
      await saveTeamToDatabase(team);
    }
    
    // Create matches with teams
    // Round of 16 - 8 matches
    for (let i = 0; i < 8; i++) {
      const match = {
        id: `r16-${i + 1}`,
        tournamentId: '1',
        round: 'Round of 16',
        team1Id: sampleTeams[i * 2].id,
        team2Id: sampleTeams[i * 2 + 1].id,
        status: 'scheduled',
        matchTime: `${2 + Math.floor(i / 2)}:${(i % 2) * 15 === 0 ? '00' : (i % 2) * 15} PM`
      };
      await saveMatchToDatabase(match);
    }
    
    // Quarterfinals, Semifinals, Final (TBD teams)
    const laterRounds = [
      { round: 'Quarterfinals', count: 4, time: '4:15 PM' },
      { round: 'Semifinals', count: 2, time: '6:30 PM' },
      { round: 'Final', count: 1, time: '8:30 PM' }
    ];
    
    for (const { round, count, time } of laterRounds) {
      for (let i = 0; i < count; i++) {
        const match = {
          id: `${round.toLowerCase().replace(' ', '-')}-${i + 1}`,
          tournamentId: '1',
          round,
          team1Id: '',
          team2Id: '',
          status: 'scheduled',
          matchTime: time
        };
        await saveMatchToDatabase(match);
      }
    }
    
    // Update tournament status to closed (full)
    await updateTournamentStatus('1', 'closed');
    
    return NextResponse.json({ 
      message: 'Tournament filled with 16 sample teams successfully!',
      teamsCreated: 16,
      matchesCreated: 15
    });

  } catch (error) {
    console.error('Error filling sample data:', error);
    return NextResponse.json({ 
      error: 'Failed to fill sample data. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
