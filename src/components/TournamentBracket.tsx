'use client';

import { useState, useEffect } from 'react';

interface Match {
  id: string;
  round: string;
  team1_name: string;
  team2_name: string;
  winner_name?: string;
  status: string;
}

interface TournamentBracketProps {
  tournamentId: string;
  tournamentStatus?: string;
}

export default function TournamentBracket({ tournamentId, tournamentStatus }: TournamentBracketProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const isRegistrationOpen = tournamentStatus === 'open' || tournamentStatus === 'upcoming';

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await fetch(`/api/matches?tournamentId=${tournamentId}`);
        const matchesData = await response.json();
        setMatches(matchesData);
      } catch (error) {
        console.error('Error loading matches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Generate full bracket structure dynamically with winner updates
  const getDisplayMatches = () => {
    // Always generate the full bracket structure
    const roundOf16Matches = matches.filter(m => m.round === 'Round of 16');
    
    // Helper to get winner of a specific match
    const getMatchWinner = (matchId: string) => {
      const match = matches.find(m => m.id === matchId);
      return match?.winner_name || undefined;
    };
    
    // Generate placeholder structure for registration open
    if (isRegistrationOpen || roundOf16Matches.length === 0) {
      return {
        'Round of 16': Array.from({ length: 8 }, (_, i) => ({
          id: `r16_${i + 1}`,
          round: 'Round of 16',
          team1_name: 'Team A',
          team2_name: 'Team B',
          winner_name: undefined,
          status: 'upcoming'
        })),
        'Quarterfinals': Array.from({ length: 4 }, (_, i) => ({
          id: `qf_${i + 1}`,
          round: 'Quarterfinals',
          team1_name: `Winner of Match ${i * 2 + 1}`,
          team2_name: `Winner of Match ${i * 2 + 2}`,
          winner_name: undefined,
          status: 'upcoming'
        })),
        'Semifinals': Array.from({ length: 2 }, (_, i) => ({
          id: `sf_${i + 1}`,
          round: 'Semifinals',
          team1_name: `Winner of QF ${i * 2 + 1}`,
          team2_name: `Winner of QF ${i * 2 + 2}`,
          winner_name: undefined,
          status: 'upcoming'
        })),
        'Finals': [{
          id: 'final_1',
          round: 'Finals',
          team1_name: 'Winner of SF 1',
          team2_name: 'Winner of SF 2',
          winner_name: undefined,
          status: 'upcoming'
        }]
      };
    }
    
    // Generate full bracket with actual winners
    return {
      'Round of 16': roundOf16Matches,
      'Quarterfinals': Array.from({ length: 4 }, (_, i) => {
        const match1Winner = getMatchWinner(`r16_${i * 2 + 1}`);
        const match2Winner = getMatchWinner(`r16_${i * 2 + 2}`);
        return {
          id: `qf_${i + 1}`,
          round: 'Quarterfinals',
          team1_name: match1Winner || `Winner of Match ${i * 2 + 1}`,
          team2_name: match2Winner || `Winner of Match ${i * 2 + 2}`,
          winner_name: undefined,
          status: (match1Winner && match2Winner) ? 'upcoming' : 'upcoming'
        };
      }),
      'Semifinals': Array.from({ length: 2 }, (_, i) => {
        const match1Winner = getMatchWinner(`qf_${i * 2 + 1}`);
        const match2Winner = getMatchWinner(`qf_${i * 2 + 2}`);
        return {
          id: `sf_${i + 1}`,
          round: 'Semifinals',
          team1_name: match1Winner || `Winner of QF ${i * 2 + 1}`,
          team2_name: match2Winner || `Winner of QF ${i * 2 + 2}`,
          winner_name: undefined,
          status: 'upcoming'
        };
      }),
      'Finals': [{
        id: 'final_1',
        round: 'Finals',
        team1_name: getMatchWinner('sf_1') || 'Winner of SF 1',
        team2_name: getMatchWinner('sf_2') || 'Winner of SF 2',
        winner_name: getMatchWinner('final_1'),
        status: 'upcoming'
      }]
    };
  };

  const displayMatches = getDisplayMatches();

  // Use display matches for rendering
  const rounds = displayMatches;

  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Tournament Bracket</h3>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>✅ Single Elimination</span>
          <span>•</span>
          <span>{matches.length} Total Matches</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-4 gap-8">
            {/* Round of 16 */}
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4 text-center">Round of 16</h4>
              <div className="space-y-4">
                {rounds['Round of 16'].map((match, index) => (
                  <div key={match.id} className="bg-slate-800/50 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-slate-500 mb-2">Match {index + 1}</div>
                    <div className="space-y-1">
                      <div className={`text-sm ${match.winner_name === match.team1_name ? 'text-emerald-400 font-semibold' : 'text-white'}`}>
                        {match.team1_name || 'TBD'}
                        {match.winner_name === match.team1_name && ' 👑'}
                      </div>
                      <div className="text-xs text-slate-500 text-center">VS</div>
                      <div className={`text-sm ${match.winner_name === match.team2_name ? 'text-emerald-400 font-semibold' : 'text-white'}`}>
                        {match.team2_name || 'TBD'}
                        {match.winner_name === match.team2_name && ' 👑'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quarterfinals */}
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4 text-center">Quarterfinals</h4>
              <div className="space-y-8">
                {rounds['Quarterfinals'].map((match, index) => (
                  <div key={match.id} className="bg-slate-800/50 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-slate-500 mb-2">Match {index + 1}</div>
                    <div className="space-y-1">
                      <div className={`text-sm ${match.winner_name === match.team1_name ? 'text-emerald-400 font-semibold' : 'text-white'}`}>
                        {match.team1_name || 'TBD'}
                        {match.winner_name === match.team1_name && ' 👑'}
                      </div>
                      <div className="text-xs text-slate-500 text-center">VS</div>
                      <div className={`text-sm ${match.winner_name === match.team2_name ? 'text-emerald-400 font-semibold' : 'text-white'}`}>
                        {match.team2_name || 'TBD'}
                        {match.winner_name === match.team2_name && ' 👑'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Semifinals */}
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4 text-center">Semifinals</h4>
              <div className="space-y-16">
                {rounds['Semifinals'].map((match, index) => (
                  <div key={match.id} className="bg-slate-800/50 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-slate-500 mb-2">Match {index + 1}</div>
                    <div className="space-y-1">
                      <div className={`text-sm ${match.winner_name === match.team1_name ? 'text-emerald-400 font-semibold' : 'text-white'}`}>
                        {match.team1_name || 'TBD'}
                        {match.winner_name === match.team1_name && ' 👑'}
                      </div>
                      <div className="text-xs text-slate-500 text-center">VS</div>
                      <div className={`text-sm ${match.winner_name === match.team2_name ? 'text-emerald-400 font-semibold' : 'text-white'}`}>
                        {match.team2_name || 'TBD'}
                        {match.winner_name === match.team2_name && ' 👑'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Finals */}
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4 text-center">Finals</h4>
              <div className="flex justify-center">
                {rounds['Finals'].map((match) => (
                  <div key={match.id} className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-lg p-4 border border-emerald-500/30">
                    <div className="text-xs text-emerald-400 mb-3 text-center font-semibold">🏆 CHAMPIONSHIP MATCH</div>
                    <div className="space-y-2">
                      <div className={`text-base ${match.winner_name === match.team1_name ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                        {match.team1_name || 'TBD'}
                        {match.winner_name === match.team1_name && ' 👑'}
                      </div>
                      <div className="text-xs text-slate-500 text-center">VS</div>
                      <div className={`text-base ${match.winner_name === match.team2_name ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                        {match.team2_name || 'TBD'}
                        {match.winner_name === match.team2_name && ' 👑'}
                      </div>
                    </div>
                    {match.winner_name && (
                      <div className="mt-3 text-center">
                        <div className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                          🏆 Winner: {match.winner_name}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex justify-between items-center text-sm text-slate-400">
          <div>📊 Tournament Progress</div>
          <div>{matches.filter(m => m.status === 'completed').length} / {matches.length} matches completed</div>
        </div>
      </div>
    </div>
  );
}
