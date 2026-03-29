'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

interface Match {
  id: string;
  tournamentName: string;
  round: string;
  player1: string;
  player2: string;
  status: 'upcoming' | 'live' | 'completed';
  result: string | null;
  scheduledTime: string;
  format: string;
}

// Generate proper time slots for 15 matches from 3 PM to 8 PM
const generateMatchTimes = () => {
  const timeSlots = [
    '3:00 PM', '3:20 PM', '3:40 PM', '4:00 PM', '4:20 PM',
    '4:40 PM', '5:00 PM', '5:20 PM', '5:40 PM', '6:00 PM',
    '6:20 PM', '6:40 PM', '7:00 PM', '7:20 PM', '7:40 PM'
  ];
  return timeSlots;
};

const mockMatches: Match[] = [
  // Round of 16 - 8 matches (16 teams total)
  {
    id: 'r16-1',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team A',
    player2: 'Team B',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[0],
    format: 'rbw 4v4'
  },
  {
    id: 'r16-2',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team C',
    player2: 'Team D',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[1],
    format: 'rbw 4v4'
  },
  {
    id: 'r16-3',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team E',
    player2: 'Team F',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[2],
    format: 'rbw 4v4'
  },
  {
    id: 'r16-4',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team G',
    player2: 'Team H',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[3],
    format: 'rbw 4v4'
  },
  {
    id: 'r16-5',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team I',
    player2: 'Team J',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[4],
    format: 'rbw 4v4'
  },
  {
    id: 'r16-6',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team K',
    player2: 'Team L',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[5],
    format: 'rbw 4v4'
  },
  {
    id: 'r16-7',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team M',
    player2: 'Team N',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[6],
    format: 'rbw 4v4'
  },
  {
    id: 'r16-8',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team O',
    player2: 'Team P',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[7],
    format: 'rbw 4v4'
  },
  
  // Quarterfinals - 4 matches (8 teams total)
  {
    id: 'qf-1',
    tournamentName: 'Blood Rush BedWars',
    round: 'Quarterfinals',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[8],
    format: 'rbw 4v4'
  },
  {
    id: 'qf-2',
    tournamentName: 'Blood Rush BedWars',
    round: 'Quarterfinals',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[9],
    format: 'rbw 4v4'
  },
  {
    id: 'qf-3',
    tournamentName: 'Blood Rush BedWars',
    round: 'Quarterfinals',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[10],
    format: 'rbw 4v4'
  },
  {
    id: 'qf-4',
    tournamentName: 'Blood Rush BedWars',
    round: 'Quarterfinals',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[11],
    format: 'rbw 4v4'
  },
  
  // Semifinals - 2 matches (4 teams total)
  {
    id: 'sf-1',
    tournamentName: 'Blood Rush BedWars',
    round: 'Semifinals',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[12],
    format: 'rbw 4v4'
  },
  {
    id: 'sf-2',
    tournamentName: 'Blood Rush BedWars',
    round: 'Semifinals',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[13],
    format: 'rbw 4v4'
  },
  
  // Finals - 1 match (2 teams total)
  {
    id: 'f-1',
    tournamentName: 'Blood Rush BedWars',
    round: 'Finals',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    result: null,
    scheduledTime: generateMatchTimes()[14],
    format: 'rbw 4v4'
  }
];

export default function Matches() {
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showTeamInfo, setShowTeamInfo] = useState(false);
  const [teamInfo, setTeamInfo] = useState<{ captain: string; players: string[] } | null>(null);
  const [tournament, setTournament] = useState<any>(null);

  // Load matches from database on mount
  useEffect(() => {
    const loadMatches = async () => {
      try {
        console.log('🔄 Matches page: Loading matches from database...');
        
        // Get the current tournament
        const { getTournaments, getMatches } = await import('@/lib/firebase-database');
        const tournaments = await getTournaments();
        
        if (tournaments.length === 0) {
          console.log('❌ Matches page: No tournaments found');
          return;
        }
        
        const tournamentId = tournaments[0].id || tournaments[0].name?.toLowerCase().replace(/\s+/g, '-');
        console.log(`📋 Matches page: Using tournament ID: ${tournamentId}`);
        
        // Set tournament data for winner display
        setTournament(tournaments[0]);
        
        console.log('🏆 Matches page: Tournament data loaded:', {
          status: tournaments[0].status,
          winner: tournaments[0].winner,
          winnerTeam: tournaments[0].winnerTeam,
          completedAt: tournaments[0].completedAt
        });
        
        // Load matches from Firebase
        const matchesData = await getMatches(tournamentId);
        console.log(`📊 Matches page: Found ${matchesData.length} matches in database`);
        
        // Log match statuses for debugging
        const statusCounts = matchesData.reduce((acc, match) => {
          acc[match.status] = (acc[match.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('📈 Matches page: Match status counts:', statusCounts);
        
        // Convert and set matches
        const convertedMatches = matchesData.map(match => ({
          id: match.id,
          tournamentName: tournaments[0].name || 'Tournament',
          round: match.round,
          player1: match.player1,
          player2: match.player2,
          status: match.status,
          result: match.result || null,
          scheduledTime: match.scheduledTime, // Use the time string directly
          format: 'rbw 4v4' as const
        }));
        
        setMatches(convertedMatches);
        console.log(`✅ Matches page: Loaded and set ${convertedMatches.length} matches`);
        
        // If no matches in Firebase, use mock matches as fallback
        if (convertedMatches.length === 0) {
          console.log('⚠️ No matches found in Firebase, using mock data');
          setMatches(mockMatches);
        }
      } catch (error) {
        console.error('❌ Error loading matches from Firebase:', error);
        // Fallback to mock matches on error
        setMatches(mockMatches);
      }
    };

    loadMatches();

    // Listen for match updates from admin panel
    let updateTimeout: NodeJS.Timeout;
    const handleMatchUpdate = (event: Event) => {
      // Clear any pending timeout to debounce rapid updates
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      
      const customEvent = event as CustomEvent;
      console.log('🔄 Matches page: Received match update event:', customEvent.detail);
      
      // Debounce the reload to prevent rapid successive calls
      updateTimeout = setTimeout(async () => {
        console.log('🔄 Matches page: Reloading due to admin update');
        
        // Check if this was a final match completion
        if (customEvent.detail?.action === 'complete' && customEvent.detail?.matchId?.includes('match-15')) {
          console.log('🏆 Matches page: Final match completed, refreshing tournament data');
          
          // Refresh tournament data to get winner info
          const { getTournaments } = await import('@/lib/firebase-database');
          const updatedTournaments = await getTournaments();
          if (updatedTournaments.length > 0) {
            setTournament(updatedTournaments[0]);
            console.log(`✅ Matches page: Tournament state refreshed:`, {
              status: updatedTournaments[0].status,
              winner: updatedTournaments[0].winner,
              winnerTeam: updatedTournaments[0].winnerTeam,
              completedAt: updatedTournaments[0].completedAt
            });
          }
        }
        
        loadMatches();
      }, 300); // 300ms debounce
    };
    
    window.addEventListener('matchUpdate', handleMatchUpdate);

    // Also listen for tournament-specific updates
    const handleTournamentUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 Matches page: Tournament update received', customEvent.detail);
      loadMatches();
    };
    
    window.addEventListener('tournamentUpdate', handleTournamentUpdate);

    return () => {
      window.removeEventListener('matchUpdate', handleMatchUpdate);
      window.removeEventListener('tournamentUpdate', handleTournamentUpdate);
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, []);

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

  const handleTeamClick = async (teamName: string) => {
    if (teamName !== 'TBD' && teamName !== 'BYE') {
      setSelectedTeam(teamName);
      setShowTeamInfo(true);
      
      // Fetch team data
      try {
        const { getTeams } = await import('@/lib/firebase-database');
        const teams = await getTeams();
        
        // Find the team by name
        const team = teams.find(t => t.name === teamName);
        
        if (team) {
          setTeamInfo({
            captain: team.captain || 'Team Captain',
            players: team.members || ['Player 1', 'Player 2', 'Player 3', 'Player 4']
          });
        } else {
          // Fallback data
          setTeamInfo({
            captain: 'Team Captain',
            players: ['Player 1', 'Player 2', 'Player 3', 'Player 4']
          });
        }
      } catch (error) {
        console.log('Team data not available, using fallback');
        setTeamInfo({
          captain: 'Team Captain',
          players: ['Player 1', 'Player 2', 'Player 3', 'Player 4']
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse';
      case 'upcoming': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return '🔴';
      case 'upcoming': return '⏰';
      case 'completed': return '✅';
      default: return '📋';
    }
  };

  return (
    <div className="pb-bottom-nav md:pb-0 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 mobile-optimized">
        {/* Professional Hero Section matching website theme */}
        <section className="relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-no-repeat"
            style={{
              backgroundImage: 'url("/wp9489772-minecraft-summer-wallpapers.jpg")',
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              backgroundAttachment: 'fixed',
              imageRendering: 'crisp-edges'
            }}
          ></div>
          
          <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 sm:py-48 md:px-8 md:py-64 safe-area-padding flex items-center justify-center">
            <div className="text-center w-full max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-purple-600/30 text-purple-200 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-purple-500/40 backdrop-blur-sm shadow-lg">
                <span className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></span>
                Championship Tournament 2026
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
                Tournament Matches
              </h1>
              <p className="text-xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                Follow the competitive journey as teams battle through the bracket for the championship title
              </p>
              
              {/* Professional Filter Tabs matching theme */}
              <div className="inline-flex bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-lg p-1">
                {(['all', 'live', 'upcoming', 'completed'] as const).map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      filter === filterOption
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {filterOption === 'all' && 'All Matches'}
                    {filterOption === 'live' && 'Live Now'}
                    {filterOption === 'upcoming' && 'Upcoming'}
                    {filterOption === 'completed' && 'Completed'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Professional Stats Overview matching theme */}
        <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 safe-area-padding">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">Total Matches</span>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                  <span className="text-purple-400">📊</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{filteredMatches.length}</div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-red-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">Live Now</span>
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
                  <span className="text-red-400">🔴</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{filteredMatches.filter(m => m.status === 'live').length}</div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">Upcoming</span>
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/30">
                  <span className="text-amber-400">⏰</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{filteredMatches.filter(m => m.status === 'upcoming').length}</div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">Completed</span>
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                  <span className="text-emerald-400">✅</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{filteredMatches.filter(m => m.status === 'completed').length}</div>
            </div>
          </div>
        </section>

        {/* Tournament Winner Display */}
        {(() => {
          console.log('🔍 Matches page: Checking winner display conditions:', {
            tournament: !!tournament,
            status: tournament?.status,
            winner: tournament?.winner,
            shouldShow: tournament?.status === 'completed' && tournament?.winner
          });
          return tournament && tournament.status === 'completed' && tournament.winner;
        })() && (
          <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 safe-area-padding">
            <div className="bg-emerald-500/10 backdrop-blur-sm rounded-3xl p-8 border-2 border-emerald-500/30 text-center">
              <div className="inline-flex items-center gap-3 bg-emerald-500/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-emerald-500/30">
                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                <h2 className="text-3xl font-bold text-emerald-400">🏆 Tournament Champion! 🏆</h2>
                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              
              <div className="bg-emerald-500/5 rounded-2xl p-8 border border-emerald-500/20">
                <h3 className="text-2xl font-semibold text-white mb-4">Winner</h3>
                <div className="text-4xl font-bold text-emerald-400 mb-6">{tournament.winner}</div>
                
                {tournament.winnerTeam && (
                  <div className="mt-6 space-y-4">
                    <div className="text-lg text-slate-300">
                      <span className="font-semibold">Captain:</span> {tournament.winnerTeam.captain}
                    </div>
                    <div className="text-lg text-slate-300">
                      <span className="font-semibold">Team Members:</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 max-w-2xl mx-auto">
                      {tournament.winnerTeam.members.map((member: string, index: number) => (
                        <div key={index} className="bg-emerald-500/20 rounded-lg px-3 py-2 text-sm text-emerald-300 border border-emerald-500/30">
                          {member}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 text-sm text-slate-400">
                  Tournament completed on: {tournament.completedAt ? new Date(tournament.completedAt).toLocaleString() : 'Unknown'}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Professional Tournament Bracket matching theme */}
        <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 safe-area-padding">
          <div className="space-y-16">
            {['Round of 16', 'Quarterfinals', 'Semifinals', 'Finals'].map((round) => {
              // Sort matches by global match number for consistent numbering
              const roundMatches = filteredMatches
                .filter(match => match.round === round)
                .sort((a, b) => {
                  // Extract match numbers and sort by global match ID
                  const getGlobalMatchNumber = (matchId: string) => {
                    const matchNum = matchId.match(/match-(\d+)$/);
                    return matchNum ? parseInt(matchNum[1]) : 0;
                  };
                  
                  const matchNumberA = getGlobalMatchNumber(a.id);
                  const matchNumberB = getGlobalMatchNumber(b.id);
                  
                  return matchNumberA - matchNumberB;
                });
              
              if (roundMatches.length === 0) return null;
              
              const roundInfo = {
                'Round of 16': { description: '8 matches → 8 winners', teams: 16 },
                'Quarterfinals': { description: '4 matches → 4 winners', teams: 8 },
                'Semifinals': { description: '2 matches → 2 winners', teams: 4 },
                'Finals': { description: '1 match → 🏆 Winner', teams: 2 }
              }[round];

              return (
                <div key={round} className="relative">
                  {/* Professional Round Header matching theme */}
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-full mb-4 border border-white/10">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
                      <h2 className="text-2xl font-bold text-white">{round}</h2>
                    </div>
                    <p className="text-slate-400 text-lg">{roundInfo?.description}</p>
                  </div>
                  
                  {/* Professional Matches Grid matching theme */}
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {roundMatches.map((match, index) => {
                      // Extract match number from ID for consistent numbering
                      const getMatchNumber = (matchId: string, round: string) => {
                        const matchNum = matchId.match(/match-(\d+)$/);
                        const globalMatchNumber = matchNum ? parseInt(matchNum[1]) : index + 1;
                        
                        // Calculate round-specific match number based on standard tournament bracket
                        switch (round) {
                          case 'Round of 16':
                            return globalMatchNumber; // Matches 1-8
                          case 'Quarterfinals':
                            return globalMatchNumber - 8; // Matches 9-12 → 1-4
                          case 'Semifinals':
                            return globalMatchNumber - 12; // Matches 13-14 → 1-2
                          case 'Finals':
                            return globalMatchNumber - 14; // Match 15 → 1
                          default:
                            return globalMatchNumber;
                        }
                      };
                      
                      const matchNumber = getMatchNumber(match.id, round);
                      
                      // Create match number prefix based on round
                      const roundPrefix = round === 'Round of 16' ? 'R16' : 
                                       round === 'Quarterfinals' ? 'QF' : 
                                       round === 'Semifinals' ? 'SF' : 'F';
                      
                      return (
                        <div 
                          key={match.id} 
                          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-purple-500/20"
                        >
                          {/* Professional Match Number */}
                          <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 bg-slate-700/50 text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold border border-white/10">
                              <span className="text-purple-400">#</span>
                              <span>{roundPrefix}-{matchNumber}</span>
                            </div>
                          </div>
                          
                          {/* Status and Time */}
                          <div className="flex items-center justify-between mb-6">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(match.status)}`}>
                              <span className="inline-block mr-1">{getStatusIcon(match.status)}</span> {match.status}
                            </span>
                            <span className="text-xs text-slate-400 font-medium bg-slate-700/50 px-3 py-1.5 rounded-lg border border-white/10">
                              {match.scheduledTime}
                            </span>
                          </div>
                          
                          {/* Professional Teams */}
                          <div className="space-y-4">
                            {/* Team 1 */}
                            <div 
                              className={`relative group/team cursor-pointer transition-all duration-200 hover:bg-slate-700/30 rounded-lg p-4 border ${
                                match.status === 'completed' && match.result?.includes(match.player1) 
                                  ? 'border-emerald-500/30 bg-emerald-500/10' 
                                  : 'border-white/10 hover:border-purple-500/30'
                              }`}
                              onClick={() => handleTeamClick(match.player1)}
                            >
                              <div className="text-center font-semibold text-lg text-white">
                                {match.player1}
                                {match.player1 !== 'TBD' && match.player1 !== 'BYE' && (
                                  <span className="block text-xs font-normal text-purple-400 mt-1 opacity-0 group-hover/team:opacity-100 transition-opacity duration-200">
                                    Click for details
                                  </span>
                                )}
                              </div>
                              {match.status === 'completed' && match.result?.includes(match.player1) && (
                                <span className="absolute -top-2 -right-2 text-emerald-400 text-lg">🏆</span>
                              )}
                            </div>
                            
                            {/* Professional VS */}
                            <div className="flex items-center justify-center">
                              <div className="bg-slate-700/50 text-slate-300 font-bold text-sm px-4 py-2 rounded-lg border border-white/10">
                                VS
                              </div>
                            </div>
                            
                            {/* Team 2 */}
                            <div 
                              className={`relative group/team cursor-pointer transition-all duration-200 hover:bg-slate-700/30 rounded-lg p-4 border ${
                                match.status === 'completed' && match.result?.includes(match.player2) 
                                  ? 'border-emerald-500/30 bg-emerald-500/10' 
                                  : 'border-white/10 hover:border-purple-500/30'
                              }`}
                              onClick={() => handleTeamClick(match.player2)}
                            >
                              <div className="text-center font-semibold text-lg text-white">
                                {match.player2}
                                {match.player2 !== 'TBD' && match.player2 !== 'BYE' && (
                                  <span className="block text-xs font-normal text-purple-400 mt-1 opacity-0 group-hover/team:opacity-100 transition-opacity duration-200">
                                    Click for details
                                  </span>
                                )}
                              </div>
                              {match.status === 'completed' && match.result?.includes(match.player2) && (
                                <span className="absolute -top-2 -right-2 text-emerald-400 text-lg">🏆</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Professional Result */}
                          {match.result && (
                            <div className="mt-6 text-center">
                              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-sm font-semibold px-4 py-2 rounded-lg border border-emerald-500/30">
                                <span>🏆</span>
                                {match.result}
                              </div>
                            </div>
                          )}
                          
                          {/* Professional Watch Live Button */}
                          {match.status === 'live' && (
                            <div className="mt-6 flex justify-center">
                              <button className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                Watch Live
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      
      {/* Professional Team Information Modal matching theme */}
      {showTeamInfo && selectedTeam && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white">
                {selectedTeam}
              </h3>
              <button
                onClick={() => {
                  setShowTeamInfo(false);
                  setSelectedTeam(null);
                }}
                className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            
            {teamInfo && (
              <div className="space-y-6">
                <div className="bg-purple-500/20 rounded-xl p-6 border border-purple-500/30">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                    <span>👑</span> Captain
                  </h4>
                  <p className="text-white font-semibold text-lg">{teamInfo.captain}</p>
                </div>
                
                <div className="bg-slate-700/50 rounded-xl p-6 border border-white/10">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <span>👥</span> Team Members
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {teamInfo.players.map((player: string, index: number) => (
                      <div key={index} className="bg-slate-600/50 rounded-lg px-3 py-2 text-white text-sm font-medium border border-white/10">
                        {player}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Footer />
      <BottomNav />
    </div>
  );
}
