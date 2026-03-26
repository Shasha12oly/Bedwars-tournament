'use client';

import { useState, useEffect } from 'react';
import { getTeams, getMatches, updateMatches } from '@/lib/database';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Match {
  id: string;
  round: string;
  player1: string;
  player2: string;
  status: 'upcoming' | 'live' | 'completed';
  result?: string;
  scheduledTime: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [teamCount, setTeamCount] = useState(0);
  const [tournamentStatus, setTournamentStatus] = useState<'open' | 'closed'>('open');
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [winner, setWinner] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFillingSampleData, setIsFillingSampleData] = useState(false);

  // Generate random team names
  const generateRandomTeamNames = () => {
    const adjectives = ['Swift', 'Thunder', 'Shadow', 'Crystal', 'Phoenix', 'Dragon', 'Storm', 'Blaze', 'Frost', 'Iron', 'Steel', 'Golden', 'Silver', 'Mystic', 'Cosmic', 'Neon'];
    const nouns = ['Warriors', 'Legends', 'Champions', 'Masters', 'Titans', 'Guardians', 'Destroyers', 'Conquerors', 'Vikings', 'Knights', 'Samurai', 'Ninjas', 'Pirates', 'Gladiators', 'Heroes', 'Challengers'];
    
    const teams = [];
    for (let i = 0; i < 16; i++) {
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      teams.push(`${adjective} ${noun}`);
    }
    return teams;
  };

  // Fill tournament with sample data
  const fillSampleData = () => {
    if (!confirm('This will fill the tournament with 16 random sample teams. Continue?')) {
      return;
    }

    setIsFillingSampleData(true);
    
    try {
      // Generate random teams
      const teamNames = generateRandomTeamNames();
      
      // Create sample team data
      const sampleTeams = teamNames.map((teamName, index) => ({
        id: `team-${index + 1}`,
        name: teamName,
        captain: `Player${index + 1}`,
        members: [`Player${index + 1}`, `Player${index + 2}`, `Player${index + 3}`],
        discord: `user${index + 1}#${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
        rewardReceiver: `Player${index + 1}`,
        status: 'confirmed' as const,
        tournamentId: '1',
        registeredAt: new Date().toISOString()
      }));

      // Save to localStorage
      localStorage.setItem('tournament_teams_1', JSON.stringify(sampleTeams));
      
      // Update matches with team names
      const updatedMatches = matches.map((match, index) => {
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

      setMatches(updatedMatches);
      localStorage.setItem('tournament_matches', JSON.stringify(updatedMatches));
      
      setTeamCount(16);
      setTournamentStatus('closed');
      
      // Dispatch custom event to update other tabs
      window.dispatchEvent(new CustomEvent('tournamentUpdate'));
      
      setMessage('✅ Tournament filled with 16 sample teams successfully!');
      
    } catch (error) {
      setMessage('❌ Error filling sample data. Please try again.');
      console.error('Sample data error:', error);
    } finally {
      setIsFillingSampleData(false);
    }
  };

  // Initialize matches
  const initializeMatches = async () => {
    const initialMatches: Match[] = [
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
    
    setMatches(initialMatches);
    await updateMatches(initialMatches);
  };

  // Load matches from database
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const matchesData = await getMatches();
        setMatches(matchesData);
      } catch (error) {
        console.error('Error loading matches:', error);
        initializeMatches();
      }
    };

    loadMatches();
  }, []);

  const sendRulesAnnouncement = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    
    try {
      const response = await fetch('/api/discord/rules-announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          channelId: '1486293985843482774',
          type: 'rules_announcement'
        }),
      });

      if (response.ok) {
        setMessage('');
        alert('Rules announcement sent successfully to Discord!');
      } else {
        alert('Failed to send announcement. Please try again.');
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      alert('Error sending announcement. Please check console.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    // Check current team count and status
    const loadTeams = async () => {
      try {
        const teams = await getTeams('1');
        setTeamCount(teams.length);
        setTournamentStatus(teams.length >= 16 ? 'closed' : 'open');
      } catch (error) {
        console.error('Error loading teams:', error);
      }
    };

    loadTeams();
  }, []);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all registrations? This action cannot be undone!')) {
      return;
    }

    setIsResetting(true);
    setMessage('');

    try {
      // Clear all tournament teams from localStorage
      localStorage.removeItem('tournament_teams_1');
      localStorage.removeItem('tournament_matches');
      
      setMessage('✅ All registrations and matches have been reset successfully!');
      setTeamCount(0);
      setTournamentStatus('open');
      initializeMatches();
      
      // Dispatch custom event to update other tabs
      window.dispatchEvent(new CustomEvent('tournamentUpdate'));
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/tournaments/1');
      }, 2000);
      
    } catch (error) {
      setMessage('❌ Error resetting registrations. Please try again.');
      console.error('Reset error:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const startMatch = async (matchId: string) => {
    const updatedMatches = matches.map(match =>
      match.id === matchId ? { ...match, status: 'live' as const } : match
    );
    setMatches(updatedMatches);
    await updateMatches(updatedMatches);
    
    // Dispatch custom event to update matches page
    window.dispatchEvent(new CustomEvent('matchUpdate'));
  };

  const completeMatch = async () => {
    if (!selectedMatch || !winner) return;

    const updatedMatches = matches.map(match => {
      if (match.id === selectedMatch.id) {
        return { ...match, status: 'completed' as const, result: `${winner} won` };
      }
      return match;
    });

    setMatches(updatedMatches);
    await updateMatches(updatedMatches);
    
    // Update next round matches with winners using the updated matches
    updateNextRoundMatches(selectedMatch, winner, updatedMatches);
    
    setSelectedMatch(null);
    setWinner('');
    setIsUpdating(false);
  };

  const updateNextRoundMatches = async (completedMatch: Match, winner: string, currentMatches: Match[]) => {
    const roundOrder = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];
    const currentRoundIndex = roundOrder.indexOf(completedMatch.round);
    const nextRound = roundOrder[currentRoundIndex + 1];
    
    if (!nextRound) return;

    // Find the current match index in its round to determine which next round slot to fill
    const currentRoundMatches = currentMatches.filter(m => m.round === completedMatch.round);
    const currentMatchIndex = currentRoundMatches.findIndex(m => m.id === completedMatch.id);
    
    // Calculate which slot in next round this winner should fill
    const nextRoundSlotIndex = Math.floor(currentMatchIndex / 2);

    const updatedMatches = currentMatches.map(match => {
      if (match.round === nextRound) {
        const nextRoundMatches = currentMatches.filter(m => m.round === nextRound);
        const targetMatch = nextRoundMatches[nextRoundSlotIndex];
        
        if (match.id === targetMatch?.id) {
          // Fill the first available slot (player1 or player2)
          if (match.player1 === 'TBD') {
            return { ...match, player1: winner };
          } else if (match.player2 === 'TBD') {
            return { ...match, player2: winner };
          }
        }
      }
      return match;
    });

    setMatches(updatedMatches);
    await updateMatches(updatedMatches);
    
    // Dispatch custom event to update matches page with next round changes
    window.dispatchEvent(new CustomEvent('matchUpdate'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500/20 text-red-400';
      case 'upcoming': return 'bg-amber-500/20 text-amber-400';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getRoundMatches = (round: string) => {
    return matches.filter(match => match.round === round);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-12">
          
          {/* Header */}
          <section className="mb-8">
            <Link 
              href="/tournaments"
              className="text-emerald-400 hover:text-emerald-300 transition-colors mb-4 inline-block"
            >
              ← Back to Tournaments
            </Link>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Admin Dashboard</h1>
            <p className="mt-2 text-slate-400">Manage tournament registrations and matches</p>
          </section>

          {/* Match Management */}
          <section className="card-glass p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Match Management</h2>
            
            <div className="space-y-6">
              {['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'].map((round) => {
                const roundMatches = getRoundMatches(round);
                return (
                  <div key={round} className="border border-white/10 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">{round}</h3>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      {roundMatches.map((match) => (
                        <div key={match.id} className="bg-white/5 rounded p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                              {match.status}
                            </span>
                            <span className="text-xs text-slate-400">{match.scheduledTime}</span>
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <div className="text-center font-medium text-white">{match.player1}</div>
                            <div className="text-center text-slate-400 text-xs">VS</div>
                            <div className="text-center font-medium text-white">{match.player2}</div>
                          </div>
                          
                          {match.result && (
                            <div className="mt-2 text-center text-xs text-emerald-400">
                              {match.result}
                            </div>
                          )}
                          
                          <div className="mt-3 flex gap-2">
                            {match.status === 'upcoming' && (
                              <button
                                onClick={() => startMatch(match.id)}
                                className="flex-1 bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-500/30 transition"
                              >
                                Start
                              </button>
                            )}
                            {match.status === 'live' && (
                              <button
                                onClick={() => {
                                  setSelectedMatch(match);
                                  setIsUpdating(true);
                                }}
                                className="flex-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs hover:bg-emerald-500/30 transition"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Winner Selection Modal */}
          {isUpdating && selectedMatch && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="card-glass p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-semibold text-white mb-4">Select Winner</h3>
                <p className="text-slate-400 mb-4">
                  {selectedMatch.player1} vs {selectedMatch.player2}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setWinner(selectedMatch.player1)}
                    className={`w-full p-3 rounded border transition ${
                      winner === selectedMatch.player1
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {selectedMatch.player1}
                  </button>
                  <button
                    onClick={() => setWinner(selectedMatch.player2)}
                    className={`w-full p-3 rounded border transition ${
                      winner === selectedMatch.player2
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {selectedMatch.player2}
                  </button>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setIsUpdating(false);
                      setSelectedMatch(null);
                      setWinner('');
                    }}
                    className="flex-1 bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={completeMatch}
                    disabled={!winner}
                    className="flex-1 btn-gradient px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Winner
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Actions */}
          <section className="card-glass p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Admin Actions</h2>
            
            <div className="space-y-6">
              {/* Sample Data */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <h3 className="text-emerald-400 font-semibold mb-2">🎮 Fill Sample Data</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Generate 16 random teams and fill the tournament bracket for testing purposes.
                  This will create sample team names, players, and Discord users.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-slate-400 text-sm">
                    Current teams: <span className="text-white font-medium">{teamCount}</span>/16
                  </div>
                  <button
                    onClick={fillSampleData}
                    disabled={isFillingSampleData || teamCount === 16}
                    className="btn-gradient px-6 py-2 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFillingSampleData ? 'Filling...' : '🎲 Fill Sample Data'}
                  </button>
                </div>
              </div>

              {/* Reset Registrations */}
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h3 className="text-red-400 font-semibold mb-2">⚠️ Reset All Registrations</h3>
                <p className="text-slate-300 text-sm mb-4">
                  This will permanently delete all registered teams and matches for the tournament and reopen registration.
                  This action cannot be undone!
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-slate-400 text-sm">
                    Current teams: <span className="text-white font-medium">{teamCount}</span>/16
                  </div>
                  <button
                    onClick={handleReset}
                    disabled={isResetting || teamCount === 0}
                    className="btn-gradient px-6 py-2 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResetting ? 'Resetting...' : '🗑️ Reset All'}
                  </button>
                </div>
              </div>

              {/* Quick Links */}
              <div className="p-4 bg-white/5 border border-white/20 rounded-lg">
                <h3 className="text-white font-semibold mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <Link 
                    href="/tournaments/1/register"
                    className="block text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    → Test Registration Page
                  </Link>
                  <Link 
                    href="/tournaments/1/rounds"
                    className="block text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    → View Tournament Bracket
                  </Link>
                  <Link 
                    href="/matches"
                    className="block text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    → View Matches Page
                  </Link>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2">ℹ️ Admin Features</h3>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• <strong>Sample Data:</strong> Generates 16 random teams with unique names and players</li>
                  <li>• <strong>Match Management:</strong> Start/complete matches and select winners</li>
                  <li>• <strong>Auto-advancement:</strong> Winners automatically move to next round</li>
                  <li>• <strong>Real-time Sync:</strong> Changes appear immediately on matches page</li>
                  <li>• <strong>LocalStorage:</strong> All data saved in browser for testing</li>
                  <li>• <strong>Reset Function:</strong> Clear all data and start fresh</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Status Message */}
          {message && (
            <div className="card-glass p-4 mb-8">
              <p className="text-white">{message}</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
