'use client';

import { useState } from 'react';
import { createTournament } from '@/lib/firebase-database';

export default function SetupTournament() {
  const [status, setStatus] = useState<string>('Ready to setup tournament');
  const [error, setError] = useState<string>('');

  const setupTournament = async () => {
    try {
      setStatus('Creating tournament in Firebase...');
      setError('');

      const tournamentData = {
        name: 'Blood Rush BedWars',
        format: 'rbw 4v4' as const,
        date: 'March 29, 2026',
        time: '2:00 PM - 9:00 PM',
        maxSlots: 16,
        status: 'open' as const,
        prize: 'Hero Rank in MCFleet (for reward receiver) | VIP+ in Hellcore (for reward receiver) | Special Discord role for all team members',
        description: 'Assemble your ultimate squad of 4 players and compete in this intense BedWars tournament. Strategy, teamwork, and skill will determine who emerges victorious.',
        rules: [
          'No cheating, hacking, or exploiting bugs',
          'Respect all players and staff',
          'Be on time for matches',
          'Follow Discord server rules',
          'Admin decisions are final'
        ],
        schedule: [
          { time: '2:00 PM', event: 'Registration closes' },
          { time: '2:15 PM', event: 'Tournament begins' },
          { time: '2:30 PM', event: 'Round of 16 starts' },
          { time: '4:15 PM', event: 'Quarterfinals' },
          { time: '6:30 PM', event: 'Semifinals' },
          { time: '8:30 PM', event: 'Finals' },
          { time: '9:00 PM', event: 'Awards ceremony' }
        ],
        prizePool: '✦ Hero Rank in MCFleet (for reward receiver)\n✦ VIP+ in Hellcore (for reward receiver)\n✦ Special Discord role for all team members'
      };

      // Create tournament with ID "1" by using a custom approach
      // Since Firebase auto-generates IDs, we'll need to update the registration page
      // to use the actual tournament ID
      const newTournament = await createTournament(tournamentData);
      
      setStatus(`✅ Tournament created successfully! ID: ${newTournament.id}`);
      console.log('Tournament created with ID:', newTournament.id);
      
    } catch (err) {
      console.error('Error creating tournament:', err);
      setError(err instanceof Error ? err.message : 'Failed to create tournament');
      setStatus('❌ Failed to create tournament');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Setup Tournament</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Initialize Tournament Data</h2>
          <p className="text-gray-600 mb-6">
            This will create the Blood Rush BedWars tournament in your Firebase database.
          </p>
          
          <div className={`p-4 rounded mb-4 ${
            status.includes('✅') ? 'bg-green-100 text-green-800' : 
            status.includes('❌') ? 'bg-red-100 text-red-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            <p className="font-medium">{status}</p>
            {error && <p className="text-sm mt-2">Error: {error}</p>}
          </div>
          
          <button 
            onClick={setupTournament}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Create Tournament in Firebase
          </button>
          
          {status.includes('✅') && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Next Step:</strong> Update your registration page to use the new tournament ID 
                instead of hardcoded "1". The tournament ID is shown in the success message above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
