'use client';

import { useState, useEffect } from 'react';
import { getTournament, getTournaments } from '@/lib/database';

export default function TestPage() {
  const [testData, setTestData] = useState<any>(null);

  useEffect(() => {
    const test = async () => {
      try {
        const allTournaments = await getTournaments();
        const tournament1 = await getTournament('1');
        
        setTestData({
          allTournaments,
          tournament1,
          tournament1Exists: !!tournament1
        });
      } catch (error) {
        setTestData({ error: error.message });
      }
    };

    test();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Tournament ID Test</h1>
      
      {testData ? (
        <div>
          <h2 className="text-xl mb-2">Results:</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(testData, null, 2)}
          </pre>
          
          {testData.tournament1Exists && (
            <div className="mt-4">
              <a 
                href="/tournaments/1" 
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
              >
                Test Tournament Details Link
              </a>
            </div>
          )}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
