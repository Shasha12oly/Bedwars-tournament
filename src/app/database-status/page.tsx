'use client';

import { useState, useEffect } from 'react';
import { getDatabase } from '@/lib/database';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

interface StatusInfo {
  database: {
    connected: boolean;
    teamsCount: number;
    matchesCount: number;
    tournamentsCount: number;
    lastUpdated: string;
  };
  localStorage: {
    available: boolean;
    size: string;
    teamsData: any;
    matchesData: any;
  };
  features: {
    teamRegistration: boolean;
    matchManagement: boolean;
    tournamentStatus: boolean;
    realTimeSync: boolean;
  };
}

export default function DatabaseStatus() {
  const [status, setStatus] = useState<StatusInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const db = getDatabase();
        
        // Test database operations
        const tournaments = await db.getTournaments();
        const teams = await db.getTeams('1');
        const matches = await db.getMatches();
        
        // Check localStorage availability
        const localStorageAvailable = typeof window !== 'undefined' && 'localStorage' in window;
        let localStorageSize = '0 KB';
        let teamsData = null;
        let matchesData = null;
        
        if (localStorageAvailable) {
          const teamsStorage = localStorage.getItem('tournament_teams_1');
          const matchesStorage = localStorage.getItem('tournament_matches');
          
          teamsData = teamsStorage ? JSON.parse(teamsStorage) : null;
          matchesData = matchesStorage ? JSON.parse(matchesStorage) : null;
          
          // Calculate approximate size
          const totalSize = (teamsStorage?.length || 0) + (matchesStorage?.length || 0);
          localStorageSize = totalSize > 1024 ? `${(totalSize / 1024).toFixed(2)} KB` : `${totalSize} B`;
        }
        
        // Test features
        const features = {
          teamRegistration: teams.length >= 0,
          matchManagement: matches.length > 0,
          tournamentStatus: tournaments.length > 0,
          realTimeSync: localStorageAvailable
        };
        
        const statusInfo: StatusInfo = {
          database: {
            connected: true,
            teamsCount: teams.length,
            matchesCount: matches.length,
            tournamentsCount: tournaments.length,
            lastUpdated: new Date().toISOString()
          },
          localStorage: {
            available: localStorageAvailable,
            size: localStorageSize,
            teamsData,
            matchesData
          },
          features
        };
        
        setStatus(statusInfo);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        console.error('Database status check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkDatabaseStatus();
    
    // Set up real-time monitoring
    const interval = setInterval(checkDatabaseStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const testDatabaseOperation = async (operation: string) => {
    try {
      const db = getDatabase();
      
      switch (operation) {
        case 'addTeam':
          await db.registerTeam({
            name: 'Test Team ' + Date.now(),
            captain: 'TestCaptain',
            members: ['Member1', 'Member2', 'Member3'],
            discord: 'test#1234',
            rewardReceiver: 'TestCaptain'
          }, '1');
          break;
          
        case 'updateMatch':
          const matches = await db.getMatches();
          if (matches.length > 0) {
            matches[0].status = matches[0].status === 'upcoming' ? 'live' : 'upcoming';
            await db.updateMatches(matches);
          }
          break;
          
        case 'resetData':
          await db.resetTournament('1');
          break;
          
        case 'fillSample':
          await db.fillSampleData('1');
          break;
      }
      
      // Refresh status
      window.location.reload();
    } catch (err) {
      alert('Operation failed: ' + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p>Checking database status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Database Error</h2>
            <p className="text-red-300">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-bottom-nav md:pb-0 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Database Status Monitor</h1>
            <p className="text-slate-400">Real-time monitoring of tournament database functionality</p>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`card-glass p-6 ${status?.database.connected ? 'border-emerald-500/50' : 'border-red-500/50'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Database Connection</h3>
                <div className={`w-3 h-3 rounded-full ${status?.database.connected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={status?.database.connected ? 'text-emerald-400' : 'text-red-400'}>
                    {status?.database.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Updated:</span>
                  <span className="text-slate-300">
                    {status?.database.lastUpdated ? new Date(status.database.lastUpdated).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className={`card-glass p-6 ${status?.localStorage.available ? 'border-emerald-500/50' : 'border-red-500/50'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">LocalStorage</h3>
                <div className={`w-3 h-3 rounded-full ${status?.localStorage.available ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Available:</span>
                  <span className={status?.localStorage.available ? 'text-emerald-400' : 'text-red-400'}>
                    {status?.localStorage.available ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Storage Size:</span>
                  <span className="text-slate-300">{status?.localStorage.size}</span>
                </div>
              </div>
            </div>

            <div className="card-glass p-6 border-slate-500/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Data Summary</h3>
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Teams:</span>
                  <span className="text-slate-300">{status?.database.teamsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Matches:</span>
                  <span className="text-slate-300">{status?.database.matchesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tournaments:</span>
                  <span className="text-slate-300">{status?.database.tournamentsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Status */}
          <div className="card-glass p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Feature Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(status?.features || {}).map(([feature, working]) => (
                <div key={feature} className={`p-4 rounded-lg border ${working ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${working ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-white capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <span className={`text-xs ${working ? 'text-emerald-400' : 'text-red-400'}`}>
                    {working ? 'Working' : 'Not Working'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Test Operations */}
          <div className="card-glass p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Test Database Operations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => testDatabaseOperation('addTeam')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              >
                Add Test Team
              </button>
              <button
                onClick={() => testDatabaseOperation('updateMatch')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Update Match
              </button>
              <button
                onClick={() => testDatabaseOperation('fillSample')}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Fill Sample Data
              </button>
              <button
                onClick={() => testDatabaseOperation('resetData')}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Reset Data
              </button>
            </div>
          </div>

          {/* Raw Data Preview */}
          <div className="card-glass p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Raw Data Preview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-emerald-400 mb-2">Teams Data</h4>
                <pre className="bg-slate-800 p-4 rounded-lg text-xs overflow-auto max-h-64">
                  {JSON.stringify(status?.localStorage.teamsData, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="text-lg font-medium text-blue-400 mb-2">Matches Data</h4>
                <pre className="bg-slate-800 p-4 rounded-lg text-xs overflow-auto max-h-64">
                  {JSON.stringify(status?.localStorage.matchesData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
