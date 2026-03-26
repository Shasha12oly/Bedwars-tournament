'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DatabaseStatus {
  teams: {
    connected: boolean;
    count: number;
    error?: string;
  };
  tournaments: {
    connected: boolean;
    count: number;
    error?: string;
  };
  matches: {
    connected: boolean;
    count: number;
    error?: string;
  };
  lastUpdated: string;
}

export default function DatabaseStatusPage() {
  const [status, setStatus] = useState<DatabaseStatus>({
    teams: { connected: false, count: 0 },
    tournaments: { connected: false, count: 0 },
    matches: { connected: false, count: 0 },
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);

  const checkDatabaseStatus = async () => {
    setLoading(true);
    const newStatus: DatabaseStatus = {
      teams: { connected: false, count: 0 },
      tournaments: { connected: false, count: 0 },
      matches: { connected: false, count: 0 },
      lastUpdated: new Date().toISOString()
    };

    try {
      // Check teams
      const teamsResponse = await fetch('/api/teams');
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        newStatus.teams = {
          connected: true,
          count: Array.isArray(teamsData) ? teamsData.length : 0
        };
      } else {
        newStatus.teams.error = 'Failed to fetch teams';
      }
    } catch (error) {
      newStatus.teams.error = 'Connection error';
    }

    try {
      // Check tournaments
      const tournamentsResponse = await fetch('/api/tournaments');
      if (tournamentsResponse.ok) {
        const tournamentsData = await tournamentsResponse.json();
        newStatus.tournaments = {
          connected: true,
          count: Array.isArray(tournamentsData) ? tournamentsData.length : 0
        };
      } else {
        newStatus.tournaments.error = 'Failed to fetch tournaments';
      }
    } catch (error) {
      newStatus.tournaments.error = 'Connection error';
    }

    try {
      // Check matches
      const matchesResponse = await fetch('/api/matches');
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        newStatus.matches = {
          connected: true,
          count: Array.isArray(matchesData) ? matchesData.length : 0
        };
      } else {
        newStatus.matches.error = 'Failed to fetch matches';
      }
    } catch (error) {
      newStatus.matches.error = 'Connection error';
    }

    setStatus(newStatus);
    setLoading(false);
  };

  useEffect(() => {
    checkDatabaseStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkDatabaseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (connected: boolean) => {
    return connected ? 'text-emerald-400' : 'text-red-400';
  };

  const getStatusIcon = (connected: boolean) => {
    return connected ? '✅' : '❌';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Database Status</h1>
          <p className="text-slate-400">Monitor database connections and data counts</p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Teams Status */}
          <div className="bg-slate-900 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Teams</h2>
              <span className={`text-2xl ${getStatusColor(status.teams.connected)}`}>
                {getStatusIcon(status.teams.connected)}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status:</span>
                <span className={getStatusColor(status.teams.connected)}>
                  {status.teams.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Count:</span>
                <span className="text-white font-medium">{status.teams.count}</span>
              </div>
              {status.teams.error && (
                <div className="text-red-400 text-sm mt-2">
                  Error: {status.teams.error}
                </div>
              )}
            </div>
          </div>

          {/* Tournaments Status */}
          <div className="bg-slate-900 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Tournaments</h2>
              <span className={`text-2xl ${getStatusColor(status.tournaments.connected)}`}>
                {getStatusIcon(status.tournaments.connected)}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status:</span>
                <span className={getStatusColor(status.tournaments.connected)}>
                  {status.tournaments.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Count:</span>
                <span className="text-white font-medium">{status.tournaments.count}</span>
              </div>
              {status.tournaments.error && (
                <div className="text-red-400 text-sm mt-2">
                  Error: {status.tournaments.error}
                </div>
              )}
            </div>
          </div>

          {/* Matches Status */}
          <div className="bg-slate-900 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Matches</h2>
              <span className={`text-2xl ${getStatusColor(status.matches.connected)}`}>
                {getStatusIcon(status.matches.connected)}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status:</span>
                <span className={getStatusColor(status.matches.connected)}>
                  {status.matches.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Count:</span>
                <span className="text-white font-medium">{status.matches.count}</span>
              </div>
              {status.matches.error && (
                <div className="text-red-400 text-sm mt-2">
                  Error: {status.matches.error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <div className="bg-slate-900 rounded-xl p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Overall Status</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-emerald-400 mb-2">System Health</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(status.teams.connected)}>
                    {getStatusIcon(status.teams.connected)}
                  </span>
                  <span className="text-slate-300">Teams Database</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(status.tournaments.connected)}>
                    {getStatusIcon(status.tournaments.connected)}
                  </span>
                  <span className="text-slate-300">Tournaments Database</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(status.matches.connected)}>
                    {getStatusIcon(status.matches.connected)}
                  </span>
                  <span className="text-slate-300">Matches Database</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-emerald-400 mb-2">Last Updated</h3>
              <p className="text-slate-300">
                {new Date(status.lastUpdated).toLocaleString()}
              </p>
              <button
                onClick={checkDatabaseStatus}
                disabled={loading}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Refreshing...' : 'Refresh Status'}
              </button>
            </div>
          </div>
        </div>

        {/* Database Information */}
        <div className="bg-slate-900 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Database Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-emerald-400 mb-2">Connection Details</h3>
              <div className="space-y-2 text-slate-300">
                <p><strong>Type:</strong> PostgreSQL</p>
                <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
                <p><strong>Connection Pool:</strong> Max 20 connections</p>
                <p><strong>Timeout:</strong> 2 seconds</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-emerald-400 mb-2">Data Tables</h3>
              <div className="space-y-2 text-slate-300">
                <p><strong>teams:</strong> Team registrations and member data</p>
                <p><strong>tournaments:</strong> Tournament configuration and settings</p>
                <p><strong>matches:</strong> Match brackets and results</p>
                <p><strong>tournament_winners:</strong> Tournament winners and prizes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
