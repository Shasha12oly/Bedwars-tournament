'use client';

import { useState, useEffect } from 'react';
import { getTeams, getTournaments, registerTeam } from '@/lib/firebase-database';

export default function TestFirebase() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [teams, setTeams] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [testTeam, setTestTeam] = useState({
    name: 'Test Team',
    captain: 'Test Captain',
    members: ['Player 1', 'Player 2', 'Player 3'],
    discord: 'test#1234',
    tournamentId: '1',
    status: 'registered' as const
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('Connecting to Firebase...');
      setError('');
      
      // Test 1: Get tournaments
      const tournamentsData = await getTournaments();
      setTournaments(tournamentsData);
      setStatus('✅ Connected! Tournaments loaded');
      
      // Test 2: Get teams
      const teamsData = await getTeams();
      setTeams(teamsData);
      setStatus('✅ Connected! Teams and tournaments loaded');
      
    } catch (err) {
      console.error('Firebase connection error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('❌ Connection failed');
    }
  };

  const handleTestRegistration = async () => {
    try {
      setStatus('Testing team registration...');
      const newTeam = await registerTeam(testTeam);
      setTeams(prev => [newTeam, ...prev]);
      setStatus('✅ Team registration successful!');
      
      // Clear form
      setTestTeam({
        name: 'Test Team',
        captain: 'Test Captain',
        members: ['Player 1', 'Player 2', 'Player 3'],
        discord: 'test#1234',
        tournamentId: '1',
        status: 'registered' as const
      });
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
      setStatus('❌ Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Firebase Connection Test</h1>
        
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className={`p-4 rounded ${status.includes('✅') ? 'bg-green-100 text-green-800' : status.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
            <p className="font-medium">{status}</p>
            {error && <p className="text-sm mt-2">Error: {error}</p>}
          </div>
          <button 
            onClick={testConnection}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Test Connection Again
          </button>
        </div>

        {/* Tournaments */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tournaments ({tournaments.length})</h2>
          {tournaments.length > 0 ? (
            <div className="space-y-2">
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{tournament.name}</p>
                  <p className="text-sm text-gray-600">Format: {tournament.format} | Slots: {tournament.maxSlots}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tournaments found</p>
          )}
        </div>

        {/* Teams */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Teams ({teams.length})</h2>
          {teams.length > 0 ? (
            <div className="space-y-2">
              {teams.slice(0, 5).map((team) => (
                <div key={team.id} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{team.name}</p>
                  <p className="text-sm text-gray-600">Captain: {team.captain} | Status: {team.status}</p>
                </div>
              ))}
              {teams.length > 5 && <p className="text-sm text-gray-500">...and {teams.length - 5} more</p>}
            </div>
          ) : (
            <p className="text-gray-500">No teams found</p>
          )}
        </div>

        {/* Test Registration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Team Registration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Team Name"
              value={testTeam.name}
              onChange={(e) => setTestTeam({...testTeam, name: e.target.value})}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Captain Name"
              value={testTeam.captain}
              onChange={(e) => setTestTeam({...testTeam, captain: e.target.value})}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Discord (user#1234)"
              value={testTeam.discord}
              onChange={(e) => setTestTeam({...testTeam, discord: e.target.value})}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={testTeam.tournamentId}
              onChange={(e) => setTestTeam({...testTeam, tournamentId: e.target.value})}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleTestRegistration}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Test Team Registration
          </button>
        </div>
      </div>
    </div>
  );
}
