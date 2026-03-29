'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fixAllMatchTimes } from '@/lib/fix-match-times';

export default function FixMatchTimesPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${log}`]);
  };

  const handleFixTimes = async () => {
    setLoading(true);
    setMessage('');
    setLogs([]);
    
    addLog('Starting match time fix...');
    
    try {
      // Override console.log to capture logs
      const originalLog = console.log;
      console.log = (...args) => {
        originalLog(...args);
        addLog(args.join(' '));
      };
      
      const success = await fixAllMatchTimes();
      
      // Restore original console.log
      console.log = originalLog;
      
      if (success) {
        setMessage('✅ Match times have been successfully updated!');
        addLog('✅ Fix completed successfully!');
      } else {
        setMessage('❌ Failed to fix match times. Check console for details.');
        addLog('❌ Fix failed!');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ An error occurred while fixing match times.');
      addLog(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🔧 Fix Match Times</h1>
            <p className="text-slate-300">Update all match times to proper 3 PM - 8 PM schedule</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.includes('✅') 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                : 'bg-red-500/20 border-red-500 text-red-400'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Schedule Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="text-emerald-400 font-semibold mb-2">Round of 16 (8 matches)</h3>
                <ul className="text-slate-300 space-y-1">
                  <li>3:00 PM - 3:20 PM - 3:40 PM - 4:00 PM</li>
                  <li>4:20 PM - 4:40 PM - 5:00 PM - 5:20 PM</li>
                </ul>
              </div>
              <div>
                <h3 className="text-blue-400 font-semibold mb-2">Quarterfinals (4 matches)</h3>
                <ul className="text-slate-300 space-y-1">
                  <li>5:40 PM - 6:00 PM - 6:20 PM - 6:40 PM</li>
                </ul>
              </div>
              <div>
                <h3 className="text-purple-400 font-semibold mb-2">Semifinals (2 matches)</h3>
                <ul className="text-slate-300 space-y-1">
                  <li>7:00 PM - 7:20 PM</li>
                </ul>
              </div>
              <div>
                <h3 className="text-amber-400 font-semibold mb-2">Finals (1 match)</h3>
                <ul className="text-slate-300 space-y-1">
                  <li>7:40 PM</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
            <button
              onClick={handleFixTimes}
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
            >
              {loading ? '🔄 Fixing Match Times...' : '🔧 Fix All Match Times'}
            </button>
            <p className="text-slate-400 text-sm mt-2">
              This will update all 15 matches to the proper time schedule.
            </p>
          </div>

          {logs.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Activity Log</h2>
              <div className="bg-slate-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                  {logs.join('\n')}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
