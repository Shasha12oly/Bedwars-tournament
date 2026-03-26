'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

interface Tournament {
  id: string;
  name: string;
  date: string;
  time: string;
  status: string;
  format: string;
  max_slots: number;
  currentTeams: number;
  prize_pool: string;
  rules: string[];
  schedule: { time: string; event: string }[];
  winner?: string;
}

const getFormatIcon = (format: string) => {
  switch (format) {
    case 'Solo': return '⚔️';
    case 'Duo': return '👥';
    case 'rbw 4v4': return '🛡️';
    case 'Rankedbedwars 4v4': return '🎮';
    default: return '🎮';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'live': return 'bg-red-500/20 text-red-400';
    case 'upcoming': return 'bg-amber-500/20 text-amber-400';
    case 'completed': return 'bg-emerald-500/20 text-emerald-400';
    case 'closed': return 'bg-slate-500/20 text-slate-400';
    default: return 'bg-slate-500/20 text-slate-400';
  }
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const [tournamentsResponse, teamsResponse] = await Promise.all([
        fetch('/api/tournaments'),
        fetch('/api/teams')
      ]);
      
      const tournamentsData = await tournamentsResponse.json();
      const teamsData = await teamsResponse.json();
      
      if (tournamentsResponse.ok) {
        // Map database fields to interface and use currentTeams from API
        const mappedTournaments = tournamentsData.map((tournament: any) => {
          // Use the currentTeams from the tournament API (already calculated)
          const currentTeams = tournament.currentTeams || teamsData.filter((team: any) => team.tournament_id === tournament.id).length;
          
          return {
            ...tournament,
            currentTeams: currentTeams,
            // Parse JSON fields if needed
            rules: typeof tournament.rules === 'string' ? JSON.parse(tournament.rules) : tournament.rules,
            schedule: typeof tournament.schedule === 'string' ? JSON.parse(tournament.schedule) : tournament.schedule
          };
        });
        
        setTournaments(mappedTournaments);
      } else {
        console.error('Failed to load tournaments:', tournamentsData);
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const filteredTournaments = tournaments.filter((tournament: Tournament) => {
    if (filter === 'all') return true;
    return tournament.format.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="pb-bottom-nav md:pb-0 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 mobile-optimized">
          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 safe-area-padding">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-white text-lg">Loading tournaments...</div>
            </div>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="pb-bottom-nav md:pb-0 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 mobile-optimized">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 safe-area-padding">
          
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
                  onClick={() => setFilter(format)}
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

          {/* Tournament Cards */}
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className="card-glass p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/20 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getFormatIcon(tournament.format)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {tournament.name}
                      </h3>
                      <p className="text-slate-400 text-sm">{tournament.format}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Date</span>
                    <span className="text-white font-medium">{tournament.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Time</span>
                    <span className="text-white font-medium">{tournament.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Slots</span>
                    <span className="text-white font-medium">{tournament.currentTeams}/{tournament.max_slots}</span>
                  </div>
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-slate-400">Prizes</span>
                    <div className="text-right max-w-[180px]">
                      <div className="space-y-1">
                        {tournament.prize_pool.split('\n').map((prize: string, index: number) => (
                          <div key={index} className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded px-2 py-1 border border-amber-500/20">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-xs text-yellow-300 font-medium leading-tight">
                                {prize.trim().split(' ').slice(1).join(' ')}
                              </span>
                              <span className="text-sm">{prize.trim().split(' ')[0]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {tournament.winner && (
                  <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                    <p className="text-emerald-400 text-sm font-medium">
                      🏆 Winner: {tournament.winner}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 text-sm font-medium">
                    {tournament.status === 'completed' ? 'View Results' : 
                     tournament.status === 'live' ? 'Watch Live' : 
                     tournament.status === 'closed' || tournament.currentTeams >= tournament.max_slots ? 'Registration Closed' : 'Join Now'}
                  </span>
                  <div className="text-emerald-400 group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </section>

          {filteredTournaments.length === 0 && !loading && (
            <section className="text-center py-12">
              <div className="text-slate-400 text-lg mb-4">No tournaments found</div>
              <p className="text-slate-500">
                {filter === 'all' 
                  ? 'Check back later for new tournaments' 
                  : `No ${filter} tournaments available at the moment`}
              </p>
            </section>
          )}
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
}
