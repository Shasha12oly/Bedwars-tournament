'use client';

import { useState, useEffect } from 'react';

export default function BotTroubleshoot() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBotToken = async () => {
    setLoading(true);
    addResult('=== Testing Bot Token ===');
    
    try {
      addResult('This app no longer tests Discord bot tokens from the browser.');
      addResult('✅ Discord sending is handled server-side via /api/discord/register.');
      addResult('1) Create .env.local with DISCORD_BOT_TOKEN and DISCORD_CHANNEL_ID');
      addResult('2) Restart the dev server');
      addResult('3) Register a team; Discord message will be sent by the server');
      
    } catch (error: any) {
      addResult(`❌ Network error: ${error.message}`);
      addResult('Check your internet connection');
    } finally {
      setLoading(false);
    }
  };

  const testBotGuilds = async () => {
    addResult('=== Testing Bot Guilds ===');
    
    try {
      addResult('Guild checks are server-side only.');
      addResult('If Discord messages fail, check server logs for /api/discord/register.');
    } catch (error: any) {
      addResult(`❌ Error getting guilds: ${error.message}`);
    }
  };

  const testChannelAccess = async () => {
    addResult('=== Testing Channel Access ===');
    
    try {
      addResult('Channel access is validated when sending messages from the server.');
      addResult('If sending fails, ensure the bot has: View Channel, Send Messages, Embed Links.');
    } catch (error: any) {
      addResult(`❌ Error testing channel: ${error.message}`);
    }
  };

  const startDevServer = () => {
    addResult('=== Starting Development Server ===');
    addResult('Please run: npm run dev');
    addResult('Then visit: http://localhost:3000/bot-test');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">🤖 Discord Bot Troubleshoot</h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={testBotToken}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 px-4 py-2 rounded text-white"
        >
          {loading ? 'Testing...' : 'Test Bot Token'}
        </button>
        
        <button
          onClick={testBotGuilds}
          className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded text-white"
        >
          Test Bot Guilds
        </button>
        
        <button
          onClick={testChannelAccess}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white"
        >
          Test Channel Access
        </button>
        
        <button
          onClick={startDevServer}
          className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded text-white"
        >
          Start Server
        </button>
      </div>
      
      <div className="bg-gray-800 p-4 rounded h-96 overflow-y-auto">
        {results.map((result, index) => (
          <div key={index} className={`text-sm mb-1 ${result.includes('✅') ? 'text-green-400' : result.includes('❌') ? 'text-red-400' : result.includes('⚠️') ? 'text-yellow-400' : result.includes('🤖') ? 'text-purple-400' : 'text-slate-300'}`}>
            {result}
          </div>
        ))}
      </div>
      
      <div className="mt-6 space-y-2 text-sm text-slate-400">
        <h3 className="text-lg font-semibold text-white mb-2">🔧 Troubleshooting Steps:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Test bot token first to verify it's valid</li>
          <li>Check if bot is in your Discord server</li>
          <li>Verify bot has permissions for the channel</li>
          <li>Make sure channel ID is correct</li>
          <li>Start development server and test full flow</li>
        </ol>
        
        <div className="mt-4 p-4 bg-amber-500/20 rounded">
          <h4 className="text-amber-400 font-bold mb-2">⚠️ Common Issues:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Bot token is invalid or expired</li>
            <li>Bot is not invited to your server</li>
            <li>Bot doesn't have message permissions</li>
            <li>Channel ID is incorrect</li>
            <li>Bot is offline in Discord</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
