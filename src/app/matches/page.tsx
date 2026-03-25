'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMatches } from '@/lib/database';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

interface Match {
  id: string;
  tournamentName: string;
  round: string;
  player1: string;
  player2: string;
  player3?: string;
  player4?: string;
  status: 'upcoming' | 'live' | 'completed';
  result?: string;
  scheduledTime: string;
  format: 'Solo' | 'Duo' | 'rbw 4v4';
}

const mockMatches: Match[] = [
  // Round of 16 - 8 matches (16 teams total)
  {
    id: 'r16-1',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team A',
    player2: 'Team B',
    status: 'upcoming',
    scheduledTime: '2:00 PM',
    format: 'rbw 4v4'
  },
  {
    id: 'r16-2',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team C',
    player2: 'Team D',
    status: 'upcoming',
    scheduledTime: '2:15 PM',
    format: 'rbw 4v4'
  },
  {
    id: 'r16-3',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team E',
    player2: 'Team F',
    status: 'upcoming',
    scheduledTime: '2:30 PM',
    format: 'rbw 4v4'
  },
  {
    id: 'r16-4',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team G',
    player2: 'Team H',
    status: 'upcoming',
    scheduledTime: '2:45 PM',
    format: 'rbw 4v4'
  },
  {
    id: 'r16-5',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team I',
    player2: 'Team J',
    status: 'upcoming',
    scheduledTime: '3:00 PM',
    format: 'rbw 4v4'
  },
  {
    id: 'r16-6',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team K',
    player2: 'Team L',
    status: 'upcoming',
    scheduledTime: '3:15 PM',
    format: 'rbw 4v4'
  },
  {
    id: 'r16-7',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team M',
    player2: 'Team N',
    status: 'upcoming',
    scheduledTime: '3:30 PM',
    format: 'rbw 4v4'
  },
  {
    id: 'r16-8',
    tournamentName: 'Blood Rush BedWars',
    round: 'Round of 16',
    player1: 'Team O',
    player2: 'Team P',
    status: 'upcoming',
    scheduledTime: '3:45 PM',
    format: 'rbw 4v4'
  },
  
  // Quarterfinals - 4 matches (8 teams)
  {
    id: 'qf-1',
    tournamentName: 'Blood Rush BedWars',
    round: 'Quarterfinals',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    scheduledTime: '4:15 PM',
    format: 'rbw 4v4'
  },
  {
    id: 'qf-2',
    tournamentName: 'Blood Rush BedWars',
    round: 'Quarterfinals',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    scheduledTime: '4:30 PM',
    format: 'rbw 4v4'
  },
  {
    id: 'qf-3',
    tournamentName: 'Blood Rush BedWars',
    round: 'Quarterfinals',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    scheduledTime: '4:45 PM',
    format: 'rbw 4v4'
  },
  {
    id: 'qf-4',
    tournamentName: 'Blood Rush BedWars',
    round: 'Quarterfinals',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    scheduledTime: '5:00 PM',
    format: 'rbw 4v4'
  },
  
  // Semifinals - 2 matches (4 teams)
  {
    id: 'sf-1',
    tournamentName: 'Blood Rush BedWars',
    round: 'Semifinals',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    scheduledTime: '6:30 PM',
    format: 'rbw 4v4'
  },
  {
    id: 'sf-2',
    tournamentName: 'Blood Rush BedWars',
    round: 'Semifinals',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    scheduledTime: '7:00 PM',
    format: 'rbw 4v4'
  },
  
  // Final - 1 match (2 teams)
  {
    id: 'final',
    tournamentName: 'Blood Rush BedWars',
    round: 'Final',
    player1: 'TBD',
    player2: 'TBD',
    status: 'upcoming',
    scheduledTime: '8:30 PM',
    format: 'rbw 4v4'
  }
];

export default function Matches() {
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [matches, setMatches] = useState<Match[]>(mockMatches);

  // Load matches from database on mount
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const matchesData = await getMatches();
        
        // Convert database match format to matches page format
        const convertedMatches = matchesData.map((match: any) => ({
          id: match.id,
          tournamentName: 'Blood Rush BedWars',
          round: match.round,
          player1: match.player1,
          player2: match.player2,
          status: match.status,
          result: match.result,
          scheduledTime: match.scheduledTime,
          format: 'rbw 4v4' as const
        }));
        
        setMatches(convertedMatches);
      } catch (error) {
        console.error('Error loading matches from database:', error);
      }
    };

    loadMatches();

    // Listen for match updates from admin panel
    const handleMatchUpdate = () => {
      loadMatches();
    };
    
    window.addEventListener('matchUpdate', handleMatchUpdate);

    return () => {
      window.removeEventListener('matchUpdate', handleMatchUpdate);
    };
  }, []);

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

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
    <div className="pb-bottom-nav md:pb-0 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-8">
          
          {/* Header */}
          <section className="mb-8">
            <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">Live Matches</h1>
            <p className="mt-2 text-slate-400">Watch ongoing and upcoming tournament matches</p>
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
                        <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping"></div>
                      </div>
                      <h2 className="text-2xl font-bold text-white animate-pulse">LIVE NOW</h2>
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
                        className="relative bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg p-4 border border-white/20 backdrop-blur-sm transition-all duration-500 hover:scale-102 hover:shadow-xl hover:shadow-red-500/20"
                        style={{
                          animationDelay: `${index * 200}ms`,
                          animation: 'slideInUp 0.6s ease-out forwards'
                        }}
                      >
                        {/* Live indicator glow */}
                        <div className="absolute top-2 right-2">
                          <div className="relative">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-emerald-400 font-bold">{match.tournamentName}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-300">{match.round}</span>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="text-white font-bold text-lg drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{match.player1}</div>
                                </div>
                                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                                  LIVE
                                </div>
                                <div className="text-center">
                                  <div className="text-white font-bold text-lg drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{match.player2}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-3xl">{getFormatIcon(match.format)}</span>
                            <div className="mt-2">
                              <button className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30">
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
                            <div className={`text-center font-bold text-lg transition-all duration-300 group-hover:scale-105 ${
                              match.status === 'completed' && match.result?.includes(match.player1) 
                                ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                                : 'text-white group-hover:text-emerald-300'
                            }`}>
                              <div className="relative">
                                {match.player1}
                                {match.status === 'completed' && match.result?.includes(match.player1) && (
                                  <span className="absolute -top-2 -right-2 text-emerald-400 animate-bounce">👑</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-center">
                              <div className="bg-gradient-to-r from-slate-600 to-slate-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg">
                                VS
                              </div>
                            </div>
                            
                            <div className={`text-center font-bold text-lg transition-all duration-300 group-hover:scale-105 ${
                              match.status === 'completed' && match.result?.includes(match.player2) 
                                ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                                : 'text-white group-hover:text-emerald-300'
                            }`}>
                              <div className="relative">
                                {match.player2}
                                {match.status === 'completed' && match.result?.includes(match.player2) && (
                                  <span className="absolute -top-2 -right-2 text-emerald-400 animate-bounce">👑</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {match.result && (
                            <div className="mt-4 text-center">
                              <div className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                                🏆 {match.result}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-4 flex justify-center">
                            {match.status === 'live' && (
                              <button className="group/btn relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30 hover:shadow-red-500/50">
                                <span className="relative z-10 flex items-center gap-2">
                                  <span className="animate-pulse">🔴</span>
                                  Watch Live
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 blur"></div>
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
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
}
