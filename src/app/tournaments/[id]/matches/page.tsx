'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

interface Tournament {
  id: string;
  name: string;
  status: string;
  format: string;
}

export default function TournamentMatchesPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournamentAndMatches();
  }, [tournamentId]);

  const loadTournamentAndMatches = async () => {
    try {
      setLoading(true);
      
      // Load tournament data
      const tournamentsResponse = await fetch('/api/tournaments');
      const tournaments = await tournamentsResponse.json();
      const tournamentData = tournaments.find((t: any) => t.id === tournamentId);
      
      if (!tournamentData) {
        setLoading(false);
        return;
      }
      
      setTournament(tournamentData);
      
      // Load matches
      const matchesResponse = await fetch(`/api/matches?tournamentId=${tournamentId}`);
      const matchesData = await matchesResponse.json();
      setMatches(matchesData);
      
    } catch (error) {
      console.error('Error loading tournament and matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeMatchesByRound = (matches: Match[]) => {
    const rounds = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Finals'];
    return rounds.map(roundName => ({
      name: roundName,
      matches: matches.filter(match => match.round === roundName)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'in_progress': return 'bg-amber-500/20 text-amber-400';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getRoundIcon = (roundName: string) => {
    switch (roundName) {
      case 'Round of 16': return '🏃';
      case 'Quarterfinals': return '⚡';
      case 'Semifinals': return '🔥';
      case 'Finals': return '🏆';
      default: return '🎮';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">Loading tournament matches...</div>
        </main>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Tournament Not Found</h1>
            <Link href="/tournaments" className="text-emerald-400 hover:text-emerald-300">
              ← Back to Tournaments
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const organizedMatches = organizeMatchesByRound(matches);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="flex-1">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-8">
          
          {/* Header */}
          <section className="mb-8">
            <Link 
              href={`/tournaments/${tournamentId}`}
              className="text-emerald-400 hover:text-emerald-300 transition-colors mb-4 inline-block flex items-center gap-2"
            >
              ← Back to Tournament
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl font-bold text-white sm:text-5xl bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Tournament Bracket
              </h1>
              <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                tournament.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                tournament.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                tournament.status === 'closed' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
              </div>
            </div>
            <p className="text-slate-400 text-lg">
              {tournament.name} • {tournament.format}
            </p>
            {tournament.status === 'completed' && (
              <div className="mt-6 p-6 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏆</span>
                  <div>
                    <p className="text-emerald-400 font-bold text-lg">Tournament Completed!</p>
                    <p className="text-emerald-300 text-sm">Congratulations to the champion!</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* No matches state */}
          {matches.length === 0 && (
            <div className="card-glass p-12 text-center backdrop-blur-sm border border-white/10">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
                <div className="relative text-8xl mb-4 animate-pulse">⏳</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Tournament Bracket Coming Soon</h3>
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-slate-300 text-lg">
                  Tournament matches will appear here once registration is closed and the bracket is generated.
                </p>
                
                {tournament.status === 'upcoming' || tournament.status === 'open' ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-amber-400">📝</span>
                      <span className="text-amber-400 font-semibold">Registration Open</span>
                    </div>
                    <p className="text-amber-300 text-sm">
                      Teams are still registering. Matches will be generated once registration closes.
                    </p>
                  </div>
                ) : tournament.status === 'closed' ? (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-blue-400">🏗️</span>
                      <span className="text-blue-400 font-semibold">Preparing Bracket</span>
                    </div>
                    <p className="text-blue-300 text-sm">
                      Registration is closed! Tournament organizers are generating the bracket right now.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-500/10 border border-slate-500/30 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-slate-400">⚙️</span>
                      <span className="text-slate-400 font-semibold">In Progress</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Tournament organizers are preparing the bracket. Check back soon!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Matches Display */}
          {matches.length > 0 && (
            <div className="space-y-10">
              {organizedMatches.map(round => (
                round.matches.length > 0 && (
                  <div key={round.name} className="relative">
                    {/* Round Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-xl"></div>
                        <div className="relative text-4xl">{getRoundIcon(round.name)}</div>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">{round.name}</h2>
                        <p className="text-slate-400">
                          {round.matches.filter(m => m.status === 'completed').length} of {round.matches.length} matches completed
                        </p>
                      </div>
                      <div className="flex-1"></div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400 mb-1">Progress</div>
                        <div className="w-32 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(round.matches.filter(m => m.status === 'completed').length / round.matches.length) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Matches Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {round.matches.map(match => (
                        <div key={match.id} className="group relative">
                          {/* Glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                          
                          {/* Match Card */}
                          <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:scale-105">
                            {/* Match Header */}
                            <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-sm px-4 py-3 border-b border-white/10">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-white">Match {match.id.split('_')[1]}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(match.status)}`}>
                                    {match.status.replace('_', ' ')}
                                  </span>
                                  <span className="text-xs text-slate-400">🕐 {match.matchTime}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Teams */}
                            <div className="p-4 space-y-3">
                              {/* Team 1 */}
                              <div className={`flex justify-between items-center p-3 rounded-xl transition-all ${
                                match.winnerId === match.team1Id 
                                  ? 'bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 border border-emerald-500/50 shadow-lg shadow-emerald-500/20' 
                                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
                              }`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                    match.winnerId === match.team1Id 
                                      ? 'bg-emerald-500 text-white' 
                                      : 'bg-slate-600 text-slate-300'
                                  }`}>
                                    1
                                  </div>
                                  <span className={`font-medium ${
                                    match.winnerId === match.team1Id ? 'text-white' : 'text-slate-300'
                                  }`}>{match.team1Name}</span>
                                </div>
                                {match.winnerId === match.team1Id && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-emerald-400 text-xl">🏆</span>
                                    <span className="text-emerald-400 text-xs font-bold">WINNER</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* VS */}
                              <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-full">
                                  <span className="text-slate-400 text-xs font-bold">VS</span>
                                </div>
                              </div>
                              
                              {/* Team 2 */}
                              <div className={`flex justify-between items-center p-3 rounded-xl transition-all ${
                                match.winnerId === match.team2Id 
                                  ? 'bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 border border-emerald-500/50 shadow-lg shadow-emerald-500/20' 
                                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
                              }`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                    match.winnerId === match.team2Id 
                                      ? 'bg-emerald-500 text-white' 
                                      : 'bg-slate-600 text-slate-300'
                                  }`}>
                                    2
                                  </div>
                                  <span className={`font-medium ${
                                    match.winnerId === match.team2Id ? 'text-white' : 'text-slate-300'
                                  }`}>{match.team2Name}</span>
                                </div>
                                {match.winnerId === match.team2Id && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-emerald-400 text-xl">🏆</span>
                                    <span className="text-emerald-400 text-xs font-bold">WINNER</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Match Footer */}
                            {match.status === 'in_progress' && (
                              <div className="px-4 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-t border-amber-500/30">
                                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                                  <span>🔴 LIVE NOW</span>
                                </div>
                              </div>
                            )}
                            
                            {match.status === 'completed' && match.winnerName && (
                              <div className="px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-t border-emerald-500/30">
                                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                  <span>🏆</span>
                                  <span>{match.winnerName} advances to next round</span>
                                </div>
                              </div>
                            )}
                            
                            {match.status === 'scheduled' && match.team1Name === 'TBD' && (
                              <div className="px-4 py-3 bg-slate-700/30 border-t border-slate-600/30">
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                  <span>⏳</span>
                                  <span>Awaiting previous round results</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Tournament Status */}
          {matches.length > 0 && (
            <div className="mt-12 card-glass p-8 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📊</span>
                <h3 className="text-2xl font-bold text-white">Tournament Progress</h3>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                {organizedMatches.map(round => (
                  round.matches.length > 0 && (
                    <div key={round.name} className="text-center group">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                        <div className="relative text-3xl group-hover:scale-110 transition-transform duration-300">
                          {getRoundIcon(round.name)}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-white mb-2">{round.name}</div>
                      <div className="text-xs text-slate-400 mb-3">
                        {round.matches.filter(m => m.status === 'completed').length} of {round.matches.length} matches
                      </div>
                      <div className="relative">
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-700 ease-out relative"
                            style={{ 
                              width: `${(round.matches.filter(m => m.status === 'completed').length / round.matches.length) * 100}%` 
                            }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {Math.round((round.matches.filter(m => m.status === 'completed').length / round.matches.length) * 100)}%
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
              
              {/* Overall Progress */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white">Overall Tournament Progress</h4>
                    <p className="text-slate-400 text-sm">
                      {matches.filter(m => m.status === 'completed').length} of {matches.length} total matches completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">
                      {Math.round((matches.filter(m => m.status === 'completed').length / matches.length) * 100)}%
                    </div>
                    <div className="text-xs text-slate-400">Complete</div>
                  </div>
                </div>
                <div className="mt-4 w-full bg-white/10 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ 
                      width: `${(matches.filter(m => m.status === 'completed').length / matches.length) * 100}%` 
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
