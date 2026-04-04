'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { getTournaments, getTeams, getTeamCount } from '@/lib/firebase-database';

interface Tournament {
  id: string;
  name: string;
  date: string;
  time: string;
  status: string;
  format: string;
  maxSlots: number;
  currentTeams: number;
  slots: number;
  prizePool?: string;
  prize?: string;
  description?: string;
  rules?: string[];
  schedule?: { time: string; event: string }[];
  winner?: string;
}

const getFormatIcon = (format: string) => {
  switch (format) {
    case 'Solo': return '⚔️';
    case 'Duo': return '👥';
    case 'rbw 4v4': return '🛡️';
    default: return '🎮';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-emerald-500/20 text-emerald-400';
    case 'closed': return 'bg-red-500/20 text-red-400';
    case 'matches_generated': return 'bg-amber-500/20 text-amber-400';
    case 'in_progress': return 'bg-blue-500/20 text-blue-400';
    case 'completed': return 'bg-purple-500/20 text-purple-400';
    default: return 'bg-slate-500/20 text-slate-400';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'open': return 'Open';
    case 'closed': return 'Closed';
    case 'matches_generated': return 'Matches Generated';
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
    default: return 'Unknown';
  }
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadTournaments = async () => {
    try {
      setLoading(true);
      
      // Load tournaments from Firebase
      const tournamentsData = await getTournaments();
      
      // Get team counts for each tournament
      const tournamentsWithCounts = await Promise.all(
        tournamentsData.map(async (tournament) => {
          const teamCount = await getTeamCount(tournament.id || '');
          
          // Get matches to check if they exist
          const { getMatches } = await import('@/lib/firebase-database');
          const matchesData = await getMatches(tournament.id || '');
          const hasMatches = matchesData.length > 0;
          
          // Check if tournament is completed (has winner)
          const isCompleted = !!tournament.winner;
          
          // Check for manual override flags from admin
          const hasManualOverride = tournament.manualStatusOverride || tournament.forceStatus;
          
          // Determine correct status based on ACTUAL conditions (not stored status)
          let correctStatus: 'open' | 'closed' | 'matches_generated' | 'completed';
          
          if (isCompleted) {
            // Has winner = Completed (highest priority)
            correctStatus = 'completed';
          } else if (hasManualOverride) {
            // Admin has manually set status - use stored status
            correctStatus = tournament.status as 'open' | 'closed' | 'matches_generated' | 'completed';
          } else if (teamCount < 16) {
            // Less than 16 teams = Open for registration
            correctStatus = 'open';
          } else if (teamCount >= 16 && !hasMatches) {
            // 16 teams, no matches = Closed (registration full)
            correctStatus = 'closed';
          } else if (teamCount >= 16 && hasMatches) {
            // 16 teams, has matches = Matches Generated
            correctStatus = 'matches_generated';
          } else {
            // Default fallback
            correctStatus = 'open';
          }
          
          console.log(`🔍 Tournament Status Check:`, {
            name: tournament.name,
            teamCount: `${teamCount}/16`,
            hasMatches: hasMatches,
            isCompleted: isCompleted,
            oldStatus: tournament.status,
            newStatus: correctStatus
          });
          
          // Update tournament in database if status is wrong
          if (correctStatus !== tournament.status && tournament.id) {
            const { updateDoc, doc } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');
            const tournamentRef = doc(db, 'tournaments', tournament.id);
            await updateDoc(tournamentRef, { status: correctStatus });
            console.log(`✅ Corrected tournament status from ${tournament.status} to ${correctStatus}`);
          }
          
          return {
            ...tournament,
            status: correctStatus,
            currentTeams: teamCount,
            slots: tournament.maxSlots
          } as unknown as Tournament;
        })
      );
      
      setTournaments(tournamentsWithCounts);
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
                    {getStatusText(tournament.status)}
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
                    <span className="text-white font-medium">{tournament.currentTeams}/{tournament.maxSlots}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Prizes</span>
                    <span className="text-emerald-400 font-bold text-right text-xs max-w-[150px] whitespace-pre-line">{tournament.prizePool}</span>
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
                     tournament.status === 'in_progress' ? 'View Matches' : 
                     tournament.status === 'matches_generated' ? 'View Matches' :
                     tournament.status === 'closed' ? 'Registration Closed' : 
                     tournament.currentTeams >= tournament.maxSlots ? 'Tournament Full' : 'Register Now'}
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
