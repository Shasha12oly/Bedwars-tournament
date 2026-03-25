'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ResetRegistrations() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [teamCount, setTeamCount] = useState(0);

  useEffect(() => {
    // Check current team count
    const teams = localStorage.getItem('tournament_teams_1');
    if (teams) {
      try {
        const parsedTeams = JSON.parse(teams);
        setTeamCount(parsedTeams.length);
      } catch (error) {
        console.error('Error parsing teams:', error);
      }
    }
  }, []);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all registrations? This action cannot be undone!')) {
      return;
    }

    setIsResetting(true);
    setMessage('');

    try {
      // Clear all tournament teams from localStorage
      localStorage.removeItem('tournament_teams_1');
      
      setMessage('✅ All registrations have been reset successfully!');
      setTeamCount(0);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/tournaments/1');
      }, 2000);
      
    } catch (error) {
      setMessage('❌ Error resetting registrations. Please try again.');
      console.error('Reset error:', error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="card-glass p-8">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">
              ⚠️ Reset All Registrations
            </h1>
            
            <div className="mb-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <h3 className="text-amber-400 font-semibold mb-2">⚠️ Warning</h3>
              <p className="text-slate-300 text-sm">
                This will permanently delete all registered teams for the tournament. This action cannot be undone!
              </p>
            </div>

            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <h3 className="text-white font-medium mb-2">Current Status</h3>
              <p className="text-slate-300">
                Registered Teams: <span className="text-emerald-400 font-bold">{teamCount}</span>/16
              </p>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg border ${
                message.includes('✅') 
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500/20 border-red-500/30 text-red-400'
              }`}>
                <p className="text-sm">{message}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleReset}
                disabled={isResetting || teamCount === 0}
                className="w-full btn-gradient py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? 'Resetting...' : '🗑️ Reset All Registrations'}
              </button>

              <Link
                href="/tournaments/1"
                className="w-full block text-center px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                ← Back to Tournament
              </Link>
            </div>

            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">ℹ️ What happens when you reset?</h3>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• All team registrations are deleted</li>
                <li>• Tournament status returns to "open"</li>
                <li>• Registration becomes available again</li>
                <li>• Discord notifications are not affected</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
