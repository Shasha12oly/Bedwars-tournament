'use client';

import { useState } from 'react';

export default function PingTest() {
  const [username, setUsername] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testPing = async () => {
    if (!username.trim()) {
      setResult('Please enter a username');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/test-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();
      
      if (data.ok) {
        setResult(`✅ Ping sent successfully! Check Discord to see if @${username.trim()} was notified.`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="card-glass p-8">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">
              🔔 Bot Ping Test
            </h1>
            
            <p className="text-slate-300 mb-8 text-center">
              Test if the Discord bot can ping users. Enter a username and see if it gets notified in Discord.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Discord Username (without #)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username to ping"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      testPing();
                    }
                  }}
                />
              </div>

              <button
                onClick={testPing}
                disabled={loading}
                className="w-full btn-gradient py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Testing...' : '🔔 Test Ping'}
              </button>

              {result && (
                <div className={`mt-6 p-4 rounded-lg border ${
                  result.includes('✅') 
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                    : 'bg-red-500/20 border-red-500/30 text-red-400'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">
                      {result.includes('✅') ? '✅' : '❌'}
                    </span>
                    <p className="text-sm">{result}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-white/5 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3">📋 How to Test:</h3>
              <ol className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">1.</span>
                  <span>Enter a Discord username (without the #1234 part)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">2.</span>
                  <span>Click "Test Ping" or press Enter</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">3.</span>
                  <span>Check your Discord to see if you get notified</span>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-400">
                  💡 <strong>Note:</strong> The bot can only ping users who are in the same Discord server as the bot.
                  If you don't get notified, the user might not be in the server or the bot lacks permissions.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a 
                href="/"
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
