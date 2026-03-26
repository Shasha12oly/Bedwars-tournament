'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tournament {
  id: string;
  name: string;
  status: string;
  currentTeams: number;
  max_slots: number;
}

interface Match {
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
}

export default function AdminMatchesPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingBracket, setGeneratingBracket] = useState(false);
  const [updatingMatch, setUpdatingMatch] = useState<string>('');

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      loadMatches();
    }
  }, [selectedTournament]);

  const loadTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments');
      const data = await response.json();
      setTournaments(data);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      const response = await fetch(`/api/matches?tournamentId=${selectedTournament}`);
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  
  const generateBracket = async () => {
    if (!selectedTournament) return;

    setGeneratingBracket(true);
    try {
      const response = await fetch('/api/matches/generate-bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: selectedTournament })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Bracket generated:', result);
        await loadMatches();
        await loadTournaments(); // Refresh tournament status
        alert(`Tournament bracket created with ${result.matches.length} matches!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error generating bracket:', error);
      alert('Failed to generate tournament bracket');
    } finally {
      setGeneratingBracket(false);
    }
  };

  const startMatch = async (matchId: string) => {
    setUpdatingMatch(matchId);
    try {
      // Here you would update match status to 'in_progress'
      // For now, we'll just show the match management interface
      alert('Match management interface would open here');
    } catch (error) {
      console.error('Error starting match:', error);
    } finally {
      setUpdatingMatch('');
    }
  };

  const completeMatch = async (matchId: string, team1Id: string, team2Id: string, team1Name: string, team2Name: string) => {
    const winner = confirm(`Who won the match?\n\nOK: ${team1Name}\nCancel: ${team2Name}`);
    const winnerId = winner ? team1Id : team2Id;
    const winnerName = winner ? team1Name : team2Name;

    setUpdatingMatch(matchId);
    try {
      const response = await fetch('/api/matches/update-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          winnerId,
          winnerName,
          tournamentId: selectedTournament
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Match updated:', result);
        await loadMatches();
        await loadTournaments(); // Refresh tournament status
        
        if (result.tournamentComplete) {
          alert(`🏆 Tournament Complete! Winner: ${result.winner}`);
        } else {
          alert('Match result updated successfully!');
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Failed to update match result');
    } finally {
      setUpdatingMatch('');
    }
  };

  const getSelectedTournament = () => {
    return tournaments.find(t => t.id === selectedTournament);
  };

  const organizeMatchesByRound = (matches: Match[]) => {
    const rounds = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Finals'];
    return rounds.map(roundName => ({
      name: roundName,
      matches: matches.filter(match => match.round === roundName)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading tournaments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold mb-2">Match Management</h1>
          <p className="text-slate-400">Generate brackets and manage tournament matches</p>
        </div>

        {/* Tournament Selection */}
        <div className="card-glass p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Tournament</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Tournament</label>
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Choose a tournament</option>
                {tournaments.map(tournament => (
                  <option key={tournament.id} value={tournament.id} className="text-gray-900">
                    {tournament.name} ({tournament.currentTeams}/{tournament.max_slots} teams) - {tournament.status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-slate-400">
                {getSelectedTournament()?.status === 'open' && (
                  <span>📝 Registration is open - bracket will be generated automatically when full</span>
                )}
                {getSelectedTournament()?.status === 'in_progress' && (
                  <span>🏗️ Registration closed - bracket will be generated automatically</span>
                )}
                {getSelectedTournament()?.status === 'closed' && (
                  <span>⏳ Bracket generation in progress...</span>
                )}
                {getSelectedTournament()?.status === 'completed' && (
                  <span>🏆 Tournament completed</span>
                )}
              </div>
            </div>
          </div>
          {selectedTournament && getSelectedTournament()?.status === 'open' && (
            <p className="text-blue-400 text-sm mt-2">ℹ️ The bracket will be automatically generated when registration closes or the tournament fills up</p>
          )}
          {selectedTournament && getSelectedTournament()?.status === 'in_progress' && (
            <p className="text-amber-400 text-sm mt-2">ℹ️ Bracket is being generated automatically - please wait a moment</p>
          )}
        </div>

        {/* Matches Display */}
        {selectedTournament && matches.length > 0 && (
          <div className="space-y-8">
            {organizeMatchesByRound(matches).map(round => (
              round.matches.length > 0 && (
                <div key={round.name} className="card-glass p-6">
                  <h3 className="text-xl font-semibold mb-4 text-emerald-400">{round.name}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {round.matches.map(match => (
                      <div key={match.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-sm text-slate-400">Match {match.id.split('_')[1]}</span>
                            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                              {match.status}
                            </span>
                          </div>
                          <span className="text-sm text-slate-400">{match.matchTime}</span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className={`flex justify-between items-center p-2 rounded ${match.winnerId === match.team1Id ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5'}`}>
                            <span className="text-sm font-medium">{match.team1Name}</span>
                            {match.winnerId === match.team1Id && <span className="text-emerald-400">🏆</span>}
                          </div>
                          <div className="text-center text-slate-500 text-xs">VS</div>
                          <div className={`flex justify-between items-center p-2 rounded ${match.winnerId === match.team2Id ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5'}`}>
                            <span className="text-sm font-medium">{match.team2Name}</span>
                            {match.winnerId === match.team2Id && <span className="text-emerald-400">🏆</span>}
                          </div>
                        </div>

                        {match.status === 'scheduled' && match.team1Id !== '' && match.team2Id !== '' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startMatch(match.id)}
                              disabled={updatingMatch === match.id}
                              className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors disabled:opacity-50"
                            >
                              {updatingMatch === match.id ? 'Starting...' : 'Start Match'}
                            </button>
                            <button
                              onClick={() => completeMatch(match.id, match.team1Id, match.team2Id, match.team1Name, match.team2Name)}
                              disabled={updatingMatch === match.id}
                              className="flex-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded transition-colors disabled:opacity-50"
                            >
                              {updatingMatch === match.id ? 'Updating...' : 'Complete Match'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* No matches state */}
        {selectedTournament && matches.length === 0 && (
          <div className="card-glass p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">No Matches Yet</h3>
            <p className="text-slate-400 mb-4">Generate a tournament bracket to start managing matches</p>
          </div>
        )}
      </div>
    </div>
  );
}
