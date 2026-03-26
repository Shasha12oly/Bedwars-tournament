'use client';

import { useState, useEffect } from 'react';
import { getTournamentsFromDatabase } from '@/lib/tournament-storage';
import TeamInfoPopup from '@/components/TeamInfoPopup';
import Link from 'next/link';

interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  round: string;
  player1: string;
  player2: string;
  player1Id?: string;
  player2Id?: string;
  status: 'upcoming' | 'live' | 'completed';
  result?: string;
  winnerId?: string;
  scheduledTime: string;
  scheduledDate: string;
  format: string;
  matchTime?: string;
  bracketPosition?: number;
  score?: string | null;
  streamUrl?: string | null;
  roomId?: string | null;
}

interface Tournament {
  id: string;
  name: string;
  format: string;
  status: string;
  max_teams: number;
  registration_deadline: string;
  start_time: string;
  end_time: string;
  prize_pool: string;
}

interface MatchesClientProps {
  initialMatches: any[];
  tournament?: any;
}

export default function MatchesClient({ initialMatches, tournament }: MatchesClientProps) {
  const [matches, setMatches] = useState(initialMatches || []);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string } | null>(null);

  // Update current time every minute for live status
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Listen for real-time match updates
  useEffect(() => {
    const handleMatchUpdate = (event: CustomEvent) => {
      const updatedMatch = event.detail;
      setMatches(prevMatches => 
        prevMatches.map(match => 
          match.id === updatedMatch.id ? { ...match, ...updatedMatch } : match
        )
      );
    };

    window.addEventListener('matchUpdate', handleMatchUpdate as EventListener);
    return () => window.removeEventListener('matchUpdate', handleMatchUpdate as EventListener);
  }, []);

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

  // Get match statistics
  const matchStats = {
    total: matches.length,
    live: matches.filter(m => m.status === 'live').length,
    upcoming: matches.filter(m => m.status === 'upcoming').length,
    completed: matches.filter(m => m.status === 'completed').length
  };

  // Format score display
  const formatScore = (score: string | null | undefined) => {
    if (!score) return null;
    try {
      const [team1, team2] = score.split('-').map(s => s.trim());
      return { team1: parseInt(team1) || 0, team2: parseInt(team2) || 0 };
    } catch {
      return null;
    }
  };

  // Handle team click
  const handleTeamClick = (teamId: string, teamName: string) => {
    if (teamId && teamId !== 'TBD' && !teamName.includes('Winner of') && !teamName.match(/^Team \d+$/)) {
      setSelectedTeam({ id: teamId, name: teamName });
    }
  };

  // Get display name for team
  const getTeamDisplayName = (teamName: string, teamId?: string) => {
    // If it's a winner slot, show as is
    if (teamName.includes('Winner of')) {
      return teamName;
    }
    
    // If it's a generic placeholder (Team 1, Team 2, etc.), show as Team A/Team B
    if (teamName.match(/^Team \d+$/)) {
      return teamName.includes('Team 1') ? 'Team A' : teamName.includes('Team 2') ? 'Team B' : teamName;
    }
    
    // For real team names, show them as they are
    return teamName;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500/20 text-red-400 animate-pulse';
      case 'upcoming': return 'bg-amber-500/20 text-amber-400';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return '🔴';
      case 'upcoming': return '🟡';
      case 'completed': return '✅';
      default: return '⚪';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Solo': return '⚔️';
      case 'Duo': return '👥';
      case 'rbw 4v4': return '🛡️';
      default: return '🎮';
    }
  };

  return (
    <main className="flex-1 mobile-optimized">
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 safe-area-padding">
        
        {/* Header with Tournament Info */}
        <section className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl mb-2">
              {tournament?.name || 'Tournament Matches'}
            </h1>
            <p className="text-slate-400 text-lg">
              {tournament?.format || 'rbw 4v4'} • {tournament?.max_teams || 16} Teams • 
              Prize Pool: {tournament?.prize_pool || '$500'}
            </p>
          </div>

          {/* Match Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-4 border border-slate-600/30 backdrop-blur-sm">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-2xl font-bold text-white">{matchStats.total}</div>
              <div className="text-sm text-slate-400">Total Matches</div>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-4 border border-red-500/30 backdrop-blur-sm">
              <div className="text-2xl mb-1">🔴</div>
              <div className="text-2xl font-bold text-red-400">{matchStats.live}</div>
              <div className="text-sm text-slate-400">Live Now</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-xl p-4 border border-amber-500/30 backdrop-blur-sm">
              <div className="text-2xl mb-1">⏰</div>
              <div className="text-2xl font-bold text-amber-400">{matchStats.upcoming}</div>
              <div className="text-sm text-slate-400">Upcoming</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl p-4 border border-emerald-500/30 backdrop-blur-sm">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-2xl font-bold text-emerald-400">{matchStats.completed}</div>
              <div className="text-sm text-slate-400">Completed</div>
            </div>
          </div>
        </section>

        {/* Time Notice Banner - Mobile Optimized */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-amber-500/10 backdrop-blur-sm">
            {/* Mobile-optimized content */}
            <div className="relative p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <span className="text-amber-400 text-lg sm:text-xl">⏰</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                    Important Time Information
                  </h3>
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-amber-400 text-sm sm:text-base font-medium">
                      📅 Tournament Date: <strong>March 29, 2026</strong>
                    </p>
                    <p className="text-white text-sm sm:text-base">
                      🕐 Time Window: <strong>2:00 PM - 9:00 PM</strong>
                    </p>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      ⚠️ Match times shown are estimates only. The tournament will be held between 2:00 PM and 9:00 PM. Actual match timing may vary based on match duration and organization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subtle animated border for mobile */}
            <div className="absolute inset-0 rounded-xl border border-amber-500/20 animate-pulse"></div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2">
            {['all', 'live', 'upcoming', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  filter === status
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {status === 'all' ? 'All Matches' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* Live Match Banner */}
        {filter === 'all' || filter === 'live' ? (
          <section className="mb-8">
            <div className="relative overflow-hidden rounded-xl border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 via-red-500/5 to-red-500/10 backdrop-blur-sm">
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-red-600/10 to-red-500/20 animate-pulse"></div>
              
              {/* Scanning line effect */}
              <div className="absolute inset-0">
                <div className="h-px bg-gradient-to-r from-transparent via-red-400 to-transparent animate-pulse"></div>
              </div>
              
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="text-2xl animate-pulse">🔴</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Live Matches</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-bold text-sm animate-pulse">
                      {filteredMatches.filter(m => m.status === 'live').length} match{filteredMatches.filter(m => m.status === 'live').length !== 1 ? 'es' : ''} live
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {filteredMatches.filter(m => m.status === 'live').map((match, index) => (
                    <div 
                      key={match.id} 
                      className="relative bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg p-3 sm:p-4 border border-white/20 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-xl hover:shadow-red-500/20"
                      style={{
                        animationDelay: `${index * 200}ms`,
                        animation: 'slideInUp 0.6s ease-out forwards'
                      }}
                    >
                      {/* Live indicator glow */}
                      <div className="absolute top-2 right-2">
                        <div className="relative">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <span className="text-emerald-400 font-bold text-sm sm:text-base truncate">{match.tournamentName}</span>
                            <span className="text-slate-300 hidden sm:inline">•</span>
                            <span className="text-slate-300 text-xs sm:text-sm">{match.round}</span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                            <div className="flex items-center gap-2 sm:gap-4">
                              <div className="text-center min-w-0 flex-1">
                                <div 
                                  className={`text-white font-bold text-sm sm:text-lg truncate drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] ${
                                    match.player1Id && match.player1Id !== 'TBD' && !match.player1.includes('Winner of') && !match.player1.includes('Team')
                                      ? 'cursor-pointer hover:text-emerald-400 transition-colors' 
                                      : ''
                                  }`}
                                  onClick={() => handleTeamClick(match.player1Id || '', match.player1)}
                                >
                                  {getTeamDisplayName(match.player1, match.player1Id)}
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full shadow-lg animate-pulse text-xs sm:text-sm">
                                LIVE
                              </div>
                              <div className="text-center min-w-0 flex-1">
                                <div 
                                  className={`text-white font-bold text-sm sm:text-lg truncate drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] ${
                                    match.player2Id && match.player2Id !== 'TBD' && !match.player2.includes('Winner of') && !match.player2.includes('Team')
                                      ? 'cursor-pointer hover:text-emerald-400 transition-colors' 
                                      : ''
                                  }`}
                                  onClick={() => handleTeamClick(match.player2Id || '', match.player2)}
                                >
                                  {getTeamDisplayName(match.player2, match.player2Id)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right sm:text-left">
                          <span className="text-2xl sm:text-3xl">{getFormatIcon(match.format)}</span>
                          <div className="mt-2 sm:mt-2">
                            <button className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 sm:px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30 text-sm sm:text-base">
                              <span className="relative z-10 flex items-center gap-2">
                                <span className="animate-pulse">▶️</span>
                                Watch Now
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Tournament Bracket */}
        <section className="space-y-8">
          {['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'].map((round) => {
            const roundMatches = filteredMatches.filter(match => match.round === round);
            const roundInfo = {
              'Round of 16': { description: '8 matches → 8 winners', teams: 16 },
              'Quarterfinals': { description: '4 matches → 4 winners', teams: 8 },
              'Semifinals': { description: '2 matches → 2 winners', teams: 4 },
              'Final': { description: '1 match → 🏆 Winner', teams: 2 }
            }[round];

            if (roundMatches.length === 0) return null;

            return (
              <div key={round} className="card-glass p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">{round}</h2>
                  <p className="text-sm text-slate-400">{roundInfo?.description}</p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {roundMatches.map((match, index) => (
                    <div 
                      key={match.id} 
                      className="group relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-500/30 overflow-hidden"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'slideInUp 0.6s ease-out forwards'
                      }}
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Glowing border effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(match.status)} transition-all duration-300 group-hover:scale-110`}>
                            <span className="inline-block animate-pulse">{getStatusIcon(match.status)}</span> {match.status}
                          </span>
                          <span className="text-xs text-slate-300 font-medium bg-white/10 px-2 py-1 rounded-full">
                            {match.scheduledTime}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Team 1 with Score */}
                          <div className={`text-center p-3 rounded-xl transition-all ${
                            match.status === 'completed' && match.result === match.player1 
                              ? 'bg-emerald-500/10 border border-emerald-500/30' 
                              : 'bg-slate-700/30 border border-white/5'
                          }`}>
                            <div className={`font-bold text-lg transition-all ${
                              match.status === 'completed' && match.result === match.player1 
                                ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                                : 'text-white'
                            } ${
                              match.player1Id && match.player1Id !== 'TBD' && !match.player1.includes('Winner of') && !match.player1.match(/^Team \d+$/)
                                ? 'cursor-pointer hover:text-emerald-300' 
                                : ''
                            }`}
                            onClick={() => handleTeamClick(match.player1Id || '', match.player1)}
                          >
                            {getTeamDisplayName(match.player1, match.player1Id)}
                          </div>
                            {match.status === 'completed' && match.result === match.player1 && (
                              <span className="text-emerald-400 text-2xl ml-2">👑</span>
                            )}
                            {match.status === 'live' && (
                              <div className="text-2xl font-bold text-red-400 mt-1">
                                {formatScore(match.score)?.team1 || 0}
                              </div>
                            )}
                          </div>
                          
                          {/* Match Status */}
                          <div className="flex items-center justify-center">
                            {match.status === 'live' ? (
                              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg animate-pulse">
                                🔴 LIVE
                              </div>
                            ) : (
                              <div className="bg-gradient-to-r from-slate-600 to-slate-500 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg">
                                VS
                              </div>
                            )}
                          </div>
                          
                          {/* Team 2 with Score */}
                          <div className={`text-center p-3 rounded-xl transition-all ${
                            match.status === 'completed' && match.result === match.player2 
                              ? 'bg-emerald-500/10 border border-emerald-500/30' 
                              : 'bg-slate-700/30 border border-white/5'
                          }`}>
                            <div className={`font-bold text-lg transition-all ${
                              match.status === 'completed' && match.result === match.player2 
                                ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                                : 'text-white'
                            } ${
                              match.player2Id && match.player2Id !== 'TBD' && !match.player2.includes('Winner of') && !match.player2.match(/^Team \d+$/)
                                ? 'cursor-pointer hover:text-emerald-300' 
                                : ''
                            }`}
                            onClick={() => handleTeamClick(match.player2Id || '', match.player2)}
                          >
                            {getTeamDisplayName(match.player2, match.player2Id)}
                          </div>
                            {match.status === 'completed' && match.result === match.player2 && (
                              <span className="text-emerald-400 text-2xl ml-2">👑</span>
                            )}
                            {match.status === 'live' && (
                              <div className="text-2xl font-bold text-red-400 mt-1">
                                {formatScore(match.score)?.team2 || 0}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Match Result */}
                        {match.status === 'completed' && match.result && (
                          <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <div className="text-center">
                              <div className="text-emerald-400 font-bold text-sm mb-1">Winner</div>
                              <div className="text-emerald-300 font-bold text-lg">{match.result}</div>
                              {match.score && (
                                <div className="text-emerald-400 text-sm mt-1">
                                  Final Score: {match.score}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 space-y-2">
                          {match.status === 'live' && (
                            <>
                              {/* Watch Live Button */}
                              <button className="w-full group/btn relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30 hover:shadow-red-500/50">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  <span className="animate-pulse">🔴</span>
                                  Watch Live
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 blur"></div>
                              </button>
                              
                              {/* Additional Actions */}
                              <div className="flex gap-2">
                                {match.streamUrl && (
                                  <a 
                                    href={match.streamUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-300 text-center border border-purple-500/30"
                                  >
                                    📺 Stream
                                  </a>
                                )}
                                {match.roomId && (
                                  <button className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-300 border border-blue-500/30">
                                    🎮 Room: {match.roomId}
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                          
                          {match.status === 'upcoming' && (
                            <button className="w-full bg-slate-600/20 hover:bg-slate-600/30 text-slate-300 py-2 px-4 rounded-lg font-medium transition-all duration-300 border border-slate-600/30">
                              ⏰ Starts at {match.scheduledTime}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <div className="card-glass p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Want to compete?</h2>
            <p className="text-slate-400 mb-6">Join our tournaments and show off your BedWars skills!</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                href="/tournaments"
                className="btn-gradient inline-flex min-h-[44px] items-center justify-center px-6 py-3"
              >
                Browse Tournaments
              </Link>
              <a 
                href="https://discord.gg/qGJhX8XA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium text-slate-200 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 min-h-[44px] inline-flex items-center justify-center"
              >
                Join Discord
              </a>
            </div>
          </div>
        </section>

        {/* Team Info Popup */}
        {selectedTeam && (
          <TeamInfoPopup
            teamId={selectedTeam.id}
            teamName={selectedTeam.name}
            onClose={() => setSelectedTeam(null)}
          />
        )}
      </div>
    </main>
  );
}
