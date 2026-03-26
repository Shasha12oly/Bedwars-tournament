'use client';

import { useState, useEffect } from 'react';

export default function BotTest() {
  const [status, setStatus] = useState('BedWars Tournament Bot made by Sharmagaming - Checking status...');
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testBotConnection = async () => {
    setIsConnecting(true);
    addLog('🔄 Testing bot connection...');
    
    try {
      // Test bot connection endpoint with proper JSON body
      const response = await fetch('/api/test-ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser' // Send a test username
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        setStatus('❌ BedWars Tournament Bot - Connection failed');
        addLog(`❌ HTTP Error: ${response.status} ${errorText}`);
        setIsConnecting(false);
        return;
      }
      
      const result = await response.json();
      
      if (result.ok) {
        setStatus('✅ BedWars Tournament Bot made by Sharmagaming - Online and ready!');
        addLog('✅ BedWars Tournament Bot connection successful');
        addLog(`📊 Response: ${JSON.stringify(result, null, 2)}`);
      } else {
        setStatus('❌ BedWars Tournament Bot - Connection failed');
        addLog(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setStatus('❌ BedWars Tournament Bot - Connection error');
      addLog(`❌ Network error: ${error}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const sendHeartbeat = async () => {
    addLog('💓 Sending heartbeat to bot...');
    
    try {
      const response = await fetch('/api/discord/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.ok) {
        setStatus('💓 Heartbeat sent successfully');
        addLog('💓 Bot heartbeat acknowledged');
        addLog(`📊 Gateway status: ${result.gatewayStatus || 'Unknown'}`);
      } else {
        setStatus('❌ Heartbeat failed');
        addLog(`❌ Heartbeat error: ${result.error}`);
      }
    } catch (error) {
      setStatus('❌ Heartbeat error');
      addLog(`❌ Network error: ${error}`);
    }
  };

  const testRegistration = async () => {
    addLog('📝 Testing team registration...');
    
    try {
      const testTeam = {
        name: 'Test Team Bot',
        captain: 'TestCaptain',
        members: ['TestPlayer1', 'TestPlayer2'],
        discord: 'testuser1,testuser2',
        tournament: {
          name: 'Test Tournament',
          id: 'test-1'
        },
        registeredAt: new Date().toISOString()
      };

      const response = await fetch('/api/discord/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team: testTeam,
          tournament: testTeam.tournament
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        setStatus('❌ Test registration failed');
        addLog(`❌ HTTP Error: ${response.status} ${errorText}`);
        return;
      }
      
      const result = await response.json();
      
      if (result.ok) {
        setStatus('📝 Test registration sent to Discord!');
        addLog('✅ Registration message sent successfully');
        addLog(`📊 Message ID: ${result.messageId || 'Unknown'}`);
      } else {
        setStatus('❌ Test registration failed');
        addLog(`❌ Registration error: ${result.error}`);
      }
    } catch (error) {
      setStatus('❌ Registration test error');
      addLog(`❌ Network error: ${error}`);
    }
  };

  const testDiscordAPI = async () => {
    addLog('🔍 Testing Discord API connectivity...');
    
    try {
      const response = await fetch('/api/test-discord-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        setStatus('❌ Discord API test failed');
        addLog(`❌ HTTP Error: ${response.status} ${errorText}`);
        return;
      }
      
      const result = await response.json();
      
      if (result.ok) {
        setStatus('✅ Discord API connectivity verified');
        addLog('✅ API test successful');
        addLog(`📊 Results: ${JSON.stringify(result.results, null, 2)}`);
      } else {
        setStatus('❌ Discord API connectivity issues');
        addLog(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setStatus('❌ API test error');
      addLog(`❌ Network error: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setStatus('Logs cleared');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">🤖 Discord Bot Test Panel</h1>
          <p className="text-slate-400 mb-6">Test your Discord bot connection, send heartbeats, and verify registration functionality.</p>
        </div>

        {/* Status Display */}
        <div className="card-glass-dark p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Bot Status</h2>
          <div className={`text-lg font-medium ${status.includes('✅') ? 'text-emerald-400' : status.includes('❌') ? 'text-red-400' : 'text-yellow-400'}`}>
            {status}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={testBotConnection}
            disabled={isConnecting}
            className="card-glass p-4 text-left hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-lg mb-2">🔌</div>
            <div className="font-semibold text-white">Test Connection</div>
            <div className="text-sm text-slate-400">Check bot API status</div>
          </button>

          <button
            onClick={sendHeartbeat}
            disabled={isConnecting}
            className="card-glass p-4 text-left hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-lg mb-2">💓</div>
            <div className="font-semibold text-white">Send Heartbeat</div>
            <div className="text-sm text-slate-400">Keep bot online</div>
          </button>

          <button
            onClick={testDiscordAPI}
            disabled={isConnecting}
            className="card-glass p-4 text-left hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-lg mb-2">🔍</div>
            <div className="font-semibold text-white">Test Discord API</div>
            <div className="text-sm text-slate-400">Check Discord connectivity</div>
          </button>

          <button
            onClick={testRegistration}
            disabled={isConnecting}
            className="card-glass p-4 text-left hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-lg mb-2">📝</div>
            <div className="font-semibold text-white">Test Registration</div>
            <div className="text-sm text-slate-400">Send test message</div>
          </button>

          <button
            onClick={clearLogs}
            className="card-glass p-4 text-left hover:-translate-y-1 transition-all duration-300"
          >
            <div className="text-lg mb-2">🗑️</div>
            <div className="font-semibold text-white">Clear Logs</div>
            <div className="text-sm text-slate-400">Reset console</div>
          </button>
        </div>

        {/* Logs Display */}
        <div className="card-glass-dark p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Activity Logs</h2>
            <div className="text-sm text-slate-400">
              {logs.length} log entries
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center py-8">
                No logs yet. Test the bot connection above.
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className={`${log.includes('✅') ? 'text-emerald-400' : log.includes('❌') ? 'text-red-400' : log.includes('🔄') || log.includes('💓') ? 'text-yellow-400' : 'text-slate-300'}`}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="card-glass-dark p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">📋 Instructions</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div>
              <strong className="text-emerald-400">1. Test Connection:</strong> Click "Test Connection" to verify bot API is working
            </div>
            <div>
              <strong className="text-emerald-400">2. Send Heartbeat:</strong> Click "Send Heartbeat" to keep bot online in Discord
            </div>
            <div>
              <strong className="text-emerald-400">3. Test Registration:</strong> Click "Test Registration" to send a test team registration message
            </div>
            <div>
              <strong className="text-yellow-400">4. Check Discord:</strong> Verify messages appear in your Discord channel
            </div>
            <div>
              <strong className="text-slate-400">5. Deploy Variables:</strong> Add environment variables in Render dashboard for production
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
