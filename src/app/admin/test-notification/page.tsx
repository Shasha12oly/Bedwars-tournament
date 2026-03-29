'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TestNotificationPage() {
  const [matchData, setMatchData] = useState({
    matchId: 'test-match-123',
    player1: 'TestPlayer1',
    player2: 'TestPlayer2',
    winner: 'TestPlayer1',
    loser: 'TestPlayer2',
    winnerDiscordId: '1215171132265861133', // Your Discord ID for testing
    loserDiscordId: '123456789012345678', // Test loser ID
    round: 'Round of 16',
    tournamentName: 'BedWars Tournament Test'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const sendTestNotification = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/discord/match-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData)
      });

      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Notification sent successfully! Channel: ${data.channelId}`);
      } else {
        const error = await response.text();
        setResult(`❌ Failed to send notification: ${error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-gaming text-slate-100">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="card-glass p-8 rounded-xl">
            <h1 className="text-3xl font-bold text-white mb-6">🏆 Test Match Notification</h1>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Match ID
                </label>
                <input
                  type="text"
                  value={matchData.matchId}
                  onChange={(e) => setMatchData({...matchData, matchId: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="test-match-123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Player 1
                </label>
                <input
                  type="text"
                  value={matchData.player1}
                  onChange={(e) => setMatchData({...matchData, player1: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="TestPlayer1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Player 2
                </label>
                <input
                  type="text"
                  value={matchData.player2}
                  onChange={(e) => setMatchData({...matchData, player2: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="TestPlayer2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Winner
                </label>
                <input
                  type="text"
                  value={matchData.winner}
                  onChange={(e) => setMatchData({...matchData, winner: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="TestPlayer1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Winner Discord ID
                </label>
                <input
                  type="text"
                  value={matchData.winnerDiscordId}
                  onChange={(e) => setMatchData({...matchData, winnerDiscordId: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="1215171132265861133"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Loser
                </label>
                <input
                  type="text"
                  value={matchData.loser}
                  onChange={(e) => setMatchData({...matchData, loser: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="TestPlayer2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Loser Discord ID
                </label>
                <input
                  type="text"
                  value={matchData.loserDiscordId}
                  onChange={(e) => setMatchData({...matchData, loserDiscordId: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="123456789012345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Round
                </label>
                <input
                  type="text"
                  value={matchData.round}
                  onChange={(e) => setMatchData({...matchData, round: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Round of 16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tournament Name
                </label>
                <input
                  type="text"
                  value={matchData.tournamentName}
                  onChange={(e) => setMatchData({...matchData, tournamentName: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="BedWars Tournament"
                />
              </div>
            </div>

            <button
              onClick={sendTestNotification}
              disabled={loading}
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? '📤 Sending...' : '🏆 Send Test Notification'}
            </button>

            {result && (
              <div className={`mt-4 p-4 rounded-lg ${
                result.includes('✅') ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'
              }`}>
                {result}
              </div>
            )}

            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">🤖 Configuration Required</h3>
              <p className="text-slate-300 text-sm">
                Set this environment variable to enable Discord bot notifications:
              </p>
              <code className="block mt-2 p-2 bg-slate-900 rounded text-emerald-400 text-xs">
                DISCORD_BOT_TOKEN=your_discord_bot_token_here
              </code>
              <p className="text-slate-400 text-xs mt-2">
                Your Discord bot will send messages to channel ID: 1487707946862510210
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
