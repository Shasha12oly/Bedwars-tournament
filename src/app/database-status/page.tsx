'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
        // Test database operations via API
        const [tournamentsResponse, teamsResponse, matchesResponse] = await Promise.all([
          fetch('/api/tournaments'),
          fetch('/api/teams'),
          fetch('/api/matches')
        ]);

        const tournaments = await tournamentsResponse.json();
        const teams = await teamsResponse.json();
        const matches = await matchesResponse.json();

        // Check localStorage availability
        const localStorageAvailable = typeof window !== 'undefined' && 'localStorage' in window;
        let localStorageSize = '0 KB';

        if (localStorageAvailable) {
          let totalSize = 0;
          for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
              totalSize += localStorage[key].length + key.length;
            }
          }
          localStorageSize = `${(totalSize / 1024).toFixed(2)} KB`;
        }

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
            size: localStorageSize
          },
          features: {
            teamRegistration: true,
            matchManagement: true,
            tournamentStatus: true,
            realTimeSync: true
          }
        };

        setStatus(statusInfo);
        setError(null);

      } catch (err) {
        console.error('Database status check failed:', err);
        setError('Failed to connect to database');
        setStatus({
          database: {
            connected: false,
            teamsCount: 0,
            matchesCount: 0,
            tournamentsCount: 0,
            lastUpdated: new Date().toISOString()
          },
          localStorage: {
            available: typeof window !== 'undefined' && 'localStorage' in window,
            size: '0 KB'
          },
          features: {
            teamRegistration: false,
            matchManagement: false,
            tournamentStatus: false,
            realTimeSync: false
          }
        });
      } finally {
        setLoading(false);
      }
    };

    checkDatabaseStatus();
    
    // Set up real-time monitoring
    const interval = setInterval(checkDatabaseStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const testDatabaseOperation = async (operation: string) => {
    try {
      switch (operation) {
        case 'addTeam':
          const response = await fetch('/api/tournaments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tournament: {
                id: '1',
                name: 'Test Tournament',
                date: '2024-12-25',
                time: '2:00 PM',
                status: 'open',
                format: '4v4',
                maxSlots: 16,
                prizePool: '$500'
              },
              team: {
                name: 'Test Team ' + Date.now(),
                captain: 'TestCaptain',
                members: ['Member1', 'Member2', 'Member3'],
                discordUsers: ['test#1234'],
                rewardReceiver: 'TestCaptain'
              }
            }),
          });
          
          if (response.ok) {
            alert('✅ Test team added successfully!');
          } else {
            alert('❌ Failed to add test team');
          }
          break;
          
        case 'checkData':
          const [teamsResponse, matchesResponse] = await Promise.all([
            fetch('/api/teams'),
            fetch('/api/matches')
          ]);
          
          const teams = await teamsResponse.json();
          const matches = await matchesResponse.json();
          
          alert(`📊 Current Data:\nTeams: ${teams.length}\nMatches: ${matches.length}`);
          break;
          
        case 'setupTournament':
          const setupResponse = await fetch('/api/setup-sample', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (setupResponse.ok) {
            alert('✅ Tournament setup completed!');
            window.location.reload();
          } else {
            const result = await setupResponse.json();
            alert('❌ Setup failed: ' + (result.error || 'Unknown error'));
          }
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Checking database status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-3xl font-bold text-white mb-4">Database Error</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="btn-gradient px-6 py-3 rounded-lg font-medium text-white w-full"
            >
              🔄 Retry Connection
            </button>
            <button
              onClick={() => testDatabaseOperation('setupTournament')}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium text-white w-full"
            >
              🚀 Setup Tournament
            </button>
            <Link
              href="/"
              className="block bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-medium text-white text-center"
            >
              🏠 Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Database Status</h1>
          <p className="text-slate-400">Monitor your tournament system performance</p>
        </div>

        {status && (
          <div className="space-y-6">
            {/* Database Status */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className={`w-3 h-3 rounded-full mr-3 ${
                  status.database.connected ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                Database Connection
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Tournaments</p>
                  <p className="text-2xl font-bold text-white">{status.database.tournamentsCount}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Teams</p>
                  <p className="text-2xl font-bold text-blue-400">{status.database.teamsCount}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Matches</p>
                  <p className="text-2xl font-bold text-green-400">{status.database.matchesCount}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Last Updated</p>
                  <p className="text-sm text-slate-300">
                    {new Date(status.database.lastUpdated).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Features Status */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">System Features</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(status.features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                    <span className="text-slate-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      value ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {value ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Operations */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Test Operations</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => testDatabaseOperation('addTeam')}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium text-white"
                >
                  🧪 Add Test Team
                </button>
                <button
                  onClick={() => testDatabaseOperation('checkData')}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-medium text-white"
                >
                  📊 Check Data
                </button>
                <button
                  onClick={() => testDatabaseOperation('setupTournament')}
                  className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-medium text-white"
                >
                  🚀 Setup Tournament
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  href="/"
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg font-medium text-white text-center"
                >
                  🏠 Home
                </Link>
                <Link
                  href="/tournaments"
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg font-medium text-white text-center"
                >
                  🏆 Tournaments
                </Link>
                <Link
                  href="/admin"
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg font-medium text-white text-center"
                >
                  ⚙️ Admin
                </Link>
                <Link
                  href="/setup"
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg font-medium text-white text-center"
                >
                  🚀 Setup
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
