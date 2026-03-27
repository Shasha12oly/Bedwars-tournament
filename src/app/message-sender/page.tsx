'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

export default function MessageSender() {
  const [channelId, setChannelId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${log}`]);
  };

  const clearLogs = () => {
    setLogs([]);
    setStatus('Logs cleared');
    setTimeout(() => setStatus(''), 2000);
  };

  const sendMessage = async () => {
    if (!channelId.trim() || !message.trim()) {
      setStatus('❌ Please fill in channel ID and message');
      return;
    }

    setIsSending(true);
    setStatus('');
    addLog('📤 Sending message to Discord...');

    try {
      const response = await fetch('/api/discord/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId: channelId.trim(),
          title: title.trim(),
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (result.ok) {
        addLog('✅ Message sent successfully!');
        addLog(`📊 Response: ${JSON.stringify(result)}`);
        setStatus('🎉 Message sent to Discord!');
      } else {
        addLog(`❌ Error: ${result.error}`);
        setStatus(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Network error: ${error}`);
      setStatus('❌ Network error occurred');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="pb-bottom-nav md:pb-0 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 mobile-optimized">
        <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 safe-area-padding">
          
          {/* Header */}
          <section className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              📨 Discord Message Sender
            </h1>
            <p className="text-slate-400">
              Send custom messages to any Discord channel with rich embeds
            </p>
          </section>

          {/* Message Form */}
          <section className="card-glass p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Send Message</h2>
            
            <div className="space-y-6">
              {/* Channel ID */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Discord Channel ID *
                </label>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  placeholder="e.g., 1486259852144807976"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Right-click channel in Discord → Copy Channel ID
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Message Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  placeholder="Enter message title (optional)"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Optional title for your message (will be shown as embed title)
                </p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
                  placeholder="Enter your message here..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  Supports Discord markdown and emojis
                </p>
              </div>

              {/* Send Button */}
              <div className="flex gap-4">
                <button
                  onClick={sendMessage}
                  disabled={isSending || !channelId.trim() || !message.trim()}
                  className="btn-gradient px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Sending...' : '📨 Send Message'}
                </button>
                
                <button
                  onClick={() => {
                    setChannelId('');
                    setTitle('');
                    setMessage('');
                    setStatus('Form cleared');
                    setTimeout(() => setStatus(''), 2000);
                  }}
                  className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  Clear
                </button>
              </div>

              {/* Status */}
              {status && (
                <div className="p-3 bg-white/10 border border-white/20 rounded-lg">
                  <p className="text-sm text-white">{status}</p>
                </div>
              )}
            </div>
          </section>

          {/* Logs */}
          <section className="card-glass p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Activity Logs</h2>
              <button
                onClick={clearLogs}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Clear Logs
              </button>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4 h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-slate-500 text-sm">No logs yet. Send a message to see activity.</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm font-mono text-slate-300">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Instructions */}
          <section className="card-glass p-6 mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">📖 How to Use</h2>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">1.</span>
                <div>
                  <strong className="text-white">Get Channel ID:</strong> In Discord, right-click on any channel and select "Copy Channel ID" (enable Developer Mode in Discord settings if you don't see this option).
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">2.</span>
                <div>
                  <strong className="text-white">Add Title (Optional):</strong> Enter a catchy title for your message. This will appear as the embed title in Discord and helps grab attention.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">3.</span>
                <div>
                  <strong className="text-white">Write Your Message:</strong> You can use Discord markdown, emojis, and formatting. The message will be sent in a beautiful embed format.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">4.</span>
                <div>
                  <strong className="text-white">Send Message:</strong> Click the send button and watch the logs to see the real-time status of your message delivery.
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <h3 className="text-emerald-400 font-medium mb-2">💡 Pro Tips</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Use catchy titles like "🏆 Tournament Winner!" or "⚔️ Match Schedule"</li>
                <li>• Use **bold** for emphasis and *italics* for style</li>
                <li>• Add emojis to make your messages more engaging 🎉🏆⚔️</li>
                <li>• Use line breaks to structure longer messages</li>
                <li>• Test with different channels to ensure permissions work</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
