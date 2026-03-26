'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

interface Team {
  id: string;
  tournamentId: string;
  name: string;
  captain: string;
  members: string[];
  discordUsers: string[];
  rewardReceiver: string;
  registeredAt: string;
  status: string;
}

interface Tournament {
  id: string;
  name: string;
  date: string;
  time: string;
  status: string;
  format: string;
  maxSlots: number;
  currentTeams: number;
  prizePool: string;
}

export default function AdminPanel() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsResponse, tournamentsResponse] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/tournaments')
      ]);

      const teamsData = await teamsResponse.json();
      const tournamentsData = await tournamentsResponse.json();

      setTeams(teamsData);
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetRegistrations = async () => {
    if (!confirm('Are you sure you want to reset all team registrations? This cannot be undone!')) {
      return;
    }

    setActionLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/reset-teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage('All team registrations have been reset successfully!');
        await loadData(); // Reload data
      } else {
        const error = await response.json();
        setMessage(`Failed to reset: ${error.error}`);
      }
    } catch (error) {
      console.error('Error resetting teams:', error);
      setMessage('Network error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) {
      return;
    }

    setActionLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/delete-team/${teamId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Team deleted successfully!');
        await loadData(); // Reload data
      } else {
        const error = await response.json();
        setMessage(`Failed to delete team: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      setMessage('Network error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pb-bottom-nav md:pb-0 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 mobile-optimized">
          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 safe-area-padding">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-white text-lg">Loading admin panel...</div>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">Admin Panel</h1>
                <p className="mt-2 text-slate-400">Manage tournament registrations</p>
              </div>
              <Link 
                href="/"
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </section>

          {/* Message */}
          {message && (
            <section className="mb-6">
              <div className={`p-4 rounded-lg ${
                message.includes('success') ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 
                'bg-red-500/20 border border-red-500/30 text-red-400'
              }`}>
                {message}
              </div>
            </section>
          )}

          {/* Stats */}
          <section className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="card-glass p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Total Teams</h3>
              <p className="text-3xl font-bold text-emerald-400">{teams.length}</p>
            </div>
            <div className="card-glass p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Active Tournaments</h3>
              <p className="text-3xl font-bold text-blue-400">{tournaments.length}</p>
            </div>
            <div className="card-glass p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Total Players</h3>
              <p className="text-3xl font-bold text-purple-400">
                {teams.reduce((total, team) => total + team.members.length, 0)}
              </p>
            </div>
          </section>

          {/* Actions */}
          <section className="mb-8">
            <div className="card-glass p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Danger Zone</h2>
              <div className="space-y-4">
                <button
                  onClick={resetRegistrations}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Resetting...' : 'Reset All Registrations'}
                </button>
                <p className="text-slate-400 text-sm">
                  ⚠️ This will delete all team registrations and cannot be undone!
                </p>
              </div>
            </div>
          </section>

          {/* Teams List */}
          <section>
            <div className="card-glass p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Registered Teams</h2>
              {teams.length === 0 ? (
                <p className="text-slate-400">No teams registered yet</p>
              ) : (
                <div className="space-y-4">
                  {teams.map((team) => {
                    const tournament = tournaments.find(t => t.id === team.tournamentId);
                    return (
                      <div key={team.id} className="border border-white/10 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                            <p className="text-slate-400 text-sm mb-2">
                              Tournament: {tournament?.name || 'Unknown'}
                            </p>
                            <p className="text-slate-300 text-sm mb-1">
                              Captain: {team.captain}
                            </p>
                            <p className="text-slate-300 text-sm mb-1">
                              Members: {team.members.join(', ')}
                            </p>
                            <p className="text-slate-300 text-sm mb-1">
                              Discord: {team.discordUsers.join(', ')}
                            </p>
                            <p className="text-slate-400 text-xs">
                              Registered: {new Date(team.registeredAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteTeam(team.id)}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
}
