'use client';

import { useState, useEffect } from 'react';
import { getTournaments, getTournament, getTeamCount } from '@/lib/database';

export default function SimpleDbTest() {
  const [results, setResults] = useState<any>({});

  useEffect(() => {
    const test = async () => {
      console.log('=== Starting Database Test ===');
      
      try {
        // Test 1: Get all tournaments
        console.log('Test 1: Getting all tournaments...');
        const tournaments = await getTournaments();
        console.log('Tournaments result:', tournaments);
        
        // Test 2: Get specific tournament
        console.log('Test 2: Getting tournament ID "1"...');
        const tournament = await getTournament('1');
        console.log('Tournament result:', tournament);
        
        // Test 3: Get team count
        console.log('Test 3: Getting team count for tournament "1"...');
        const teamCount = await getTeamCount('1');
        console.log('Team count result:', teamCount);
        
        setResults({
          tournaments: tournaments,
          tournament: tournament,
          teamCount: teamCount,
          success: true
        });
        
      } catch (error) {
        console.error('Database test error:', error);
        setResults({
          error: error.message,
          success: false
        });
      }
      
      console.log('=== Database Test Complete ===');
    };

    test();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Database Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg mb-2">Results:</h2>
        <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
      
      {results.success ? (
        <div className="space-y-4">
          <div className="bg-green-500/20 p-4 rounded">
            <h3 className="text-green-400 font-bold">✅ Database Working!</h3>
            <p>Found {results.tournaments?.length || 0} tournaments</p>
            <p>Team count: {results.teamCount}</p>
          </div>
          
          {results.tournaments?.length > 0 && (
            <div>
              <a href="/tournaments" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white">
                Go to Tournaments Page
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-red-500/20 p-4 rounded">
          <h3 className="text-red-400 font-bold">❌ Database Error</h3>
          <p>{results.error}</p>
        </div>
      )}
    </div>
  );
}
