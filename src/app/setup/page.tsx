'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SetupPage() {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [message, setMessage] = useState('');
  const [tournamentCreated, setTournamentCreated] = useState(false);

  const setupDatabase = async () => {
    setIsSettingUp(true);
    setMessage('');

    try {
      const response = await fetch('/api/setup-sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ ' + result.message);
        setTournamentCreated(true);
      } else {
        setMessage('❌ ' + (result.error || 'Setup failed'));
      }
    } catch (error) {
      setMessage('❌ Error setting up database. Please try again.');
      console.error('Setup error:', error);
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">🏆 Tournament Setup</h1>
          <p className="text-xl text-slate-400">
            Initialize your BedWars tournament database
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">🎮 What this setup does:</h2>
          <ul className="space-y-3 text-slate-300 mb-8">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              Creates sample tournament: "BedWars Championship 2024"
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              Sets up tournament brackets for 16 teams
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              Configures match schedule and prize pool
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              Opens registration for team signups
            </li>
          </ul>

          {!tournamentCreated ? (
            <div className="text-center">
              <button
                onClick={setupDatabase}
                disabled={isSettingUp}
                className="btn-gradient px-8 py-4 rounded-lg font-medium text-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSettingUp ? '⏳ Setting up...' : '🚀 Setup Tournament Database'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-white mb-2">Setup Complete!</h3>
                <p className="text-slate-300">Your tournament is ready to go</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tournaments/1"
                  className="btn-gradient px-6 py-3 rounded-lg font-medium text-white inline-block text-center"
                >
                  🏆 View Tournament
                </Link>
                <Link
                  href="/tournaments/1/register"
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium text-white inline-block text-center"
                >
                  📝 Register Team
                </Link>
                <Link
                  href="/admin"
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium text-white inline-block text-center"
                >
                  ⚙️ Admin Panel
                </Link>
              </div>
            </div>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-center ${
            message.includes('✅') ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 
            'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">📋 Next Steps:</h3>
          <ol className="space-y-2 text-slate-300">
            <li>1. Click "Setup Tournament Database" above</li>
            <li>2. Visit the tournament page to see details</li>
            <li>3. Use the admin panel to fill sample data</li>
            <li>4. Open registration for teams to join</li>
            <li>5. Manage matches and track winners</li>
          </ol>
        </div>
      </div>
      <Footer />
    </div>
  );
}
