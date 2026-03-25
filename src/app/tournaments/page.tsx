'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { getTournaments, getTeamCount, getMatches, Tournament as DbTournament } from '@/lib/database';

interface Tournament {
  id: string;
  name: string;
  format: 'Solo' | 'Duo' | 'rbw 4v4';
  date: string;
  time: string;
  slots: number;
  registered: number;
  status: 'open' | 'closed' | 'ongoing' | 'completed';
  prize: string;
  winner?: string;
}

export default function Tournaments() {
  const [filter, setFilter] = useState<'all' | 'solo' | 'duo' | 'rbw 4v4'>('all');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        console.log('Loading tournaments...');
        setLoading(true);
        
        const tournamentData = await getTournaments();
        console.log('Tournament data received:', tournamentData);
        
        if (!tournamentData || tournamentData.length === 0) {
          console.log('No tournaments found in database');
          setTournaments([]);
          setLoading(false);
          return;
        }
        
        const tournamentsWithStats = await Promise.all(
          tournamentData.map(async (tournament) => {
            const teamCount = await getTeamCount(tournament.id);
            
            // Check if tournament is completed by checking matches
            const matchesData = await getMatches();
            let tournamentStatus = teamCount >= tournament.maxSlots ? 'closed' : tournament.status;
            let winner: string | undefined = undefined;
            
            if (matchesData) {
              const completedMatches = matchesData.filter((m: any) => m.status === 'completed');
              const totalMatches = matchesData.length;
              
              // Tournament is completed if all matches are done
              if (completedMatches.length === totalMatches && totalMatches > 0) {
                tournamentStatus = 'completed';
                
                // Find the final match winner
                const finalMatch = matchesData.find((m: any) => m.round === 'Final');
                if (finalMatch && finalMatch.result) {
                  // Extract winner from result format "Team Name won"
                  winner = finalMatch.result.replace(' won', '');
                }
              }
            }
            
            return {
              ...tournament,
              slots: tournament.maxSlots,
              registered: teamCount,
              status: tournamentStatus,
              winner
            };
          })
        );
        console.log('Tournaments with stats:', tournamentsWithStats);
        setTournaments(tournamentsWithStats);
        setLoading(false);
      } catch (error) {
        console.error('Error loading tournaments:', error);
        setTournaments([]);
        setLoading(false);
      }
    };

    loadTournaments();

    // Listen for localStorage changes to update tournament status in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('tournament_teams_') || e.key === 'tournament_matches')) {
        console.log('Storage changed, reloading tournaments...');
        loadTournaments();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    const handleCustomUpdate = () => {
      console.log('Custom update event received, reloading tournaments...');
      loadTournaments();
    };
    
    const handleMatchUpdate = () => {
      console.log('Match update event received, reloading tournaments...');
      loadTournaments();
    };
    
    window.addEventListener('tournamentUpdate', handleCustomUpdate);
    window.addEventListener('matchUpdate', handleMatchUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tournamentUpdate', handleCustomUpdate);
      window.removeEventListener('matchUpdate', handleMatchUpdate);
    };
  }, []);

  const filteredTournaments = tournaments.filter(tournament => {
    if (filter === 'all') return true;
    return tournament.format.toLowerCase() === filter;
  });

  console.log('Tournaments page - Raw tournaments:', tournaments);
  console.log('Tournaments page - Filter:', filter);
  console.log('Tournaments page - Filtered tournaments:', filteredTournaments);
  console.log('Tournaments page - Loading:', loading);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-emerald-500/20 text-emerald-400';
      case 'closed': return 'bg-red-500/20 text-red-400';
      case 'ongoing': return 'bg-amber-500/20 text-amber-400';
      case 'completed': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-slate-500/20 text-slate-400';
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-8">
          
          {/* Header */}
          <section className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">Tournaments</h1>
              <p className="mt-2 text-slate-400">Join competitive BedWars tournaments and win amazing prizes</p>
            </div>
          </section>

          {/* Filter Tabs */}
          <section className="mb-8">
            <div className="flex flex-wrap gap-2">
              {['all', 'solo', 'duo', 'rbw 4v4'].map((format) => (
                <button
                  key={format}
                  onClick={() => setFilter(format as any)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    filter === format
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {format === 'all' ? 'All Formats' : format.charAt(0).toUpperCase() + format.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* Tournaments Grid */}
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="text-slate-400">Loading tournaments...</div>
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="card-glass p-8 max-w-md mx-auto">
                  <span className="text-4xl mb-4 block">🎮</span>
                  <h3 className="text-xl font-semibold text-white mb-2">No tournaments found</h3>
                  <p className="text-slate-400 mb-4">Check back later for new tournaments or try a different filter.</p>
                  <div className="text-xs text-slate-500">
                    Debug: Raw tournaments: {tournaments.length}, Filter: {filter}, Filtered: {filteredTournaments.length}
                  </div>
                </div>
              </div>
            ) : (
              filteredTournaments.map((tournament) => (
              <div key={tournament.id} className="card-glass p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFormatIcon(tournament.format)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{tournament.name}</h3>
                      <p className="text-sm text-emerald-400">{tournament.format}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                    {tournament.status === 'completed' ? '🏆 Completed' : tournament.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {tournament.date} at {tournament.time}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tournament.registered}/{tournament.slots} slots filled
                  </div>

                  <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 rounded-lg p-3 border border-amber-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-amber-400 text-lg">🏆</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Prize Pool</span>
                    </div>
                    <div className="text-sm font-medium text-white leading-relaxed">
                      {tournament.prize.split('|').map((prize: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 mb-1 last:mb-0">
                          <span className="text-emerald-400 text-xs mt-0.5">•</span>
                          <span className="text-slate-200">{prize.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Winner Display */}
                  {tournament.status === 'completed' && tournament.winner && (
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-3 border border-purple-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-400 text-lg">👑</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Winner</span>
                      </div>
                      <div className="text-lg font-bold text-white text-center">
                        🏆 {tournament.winner} 🏆
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(tournament.registered / tournament.slots) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link 
                    href={`/tournaments/${tournament.id}`}
                    className="flex-1 btn-gradient text-center py-2 px-4 rounded-lg font-medium text-sm"
                  >
                    {tournament.status === 'completed' ? 'View Results' : 'View Details'}
                  </Link>
                  {tournament.status === 'open' && (
                    <Link 
                      href={`/tournaments/${tournament.id}/register`}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-center py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300"
                    >
                      Register
                    </Link>
                  )}
                  {tournament.status === 'completed' && (
                    <Link 
                      href={`/matches`}
                      className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-center py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 border border-purple-500/30"
                    >
                      View Bracket
                    </Link>
                  )}
                </div>
              </div>
            ))
            )}
          </section>

          {/* CTA Section */}
          <section className="mt-16 text-center">
            <div className="card-glass p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to compete?</h2>
              <p className="text-slate-400 mb-6">Join our Discord for tournament updates and community discussions.</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a 
                  href="https://discord.gg/qGJhX8XA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-gradient inline-flex min-h-[44px] items-center justify-center px-6 py-3"
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
