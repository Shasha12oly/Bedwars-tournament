'use client';

import { useState } from 'react';

export default function AdminPanel() {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  const sendRulesAnnouncement = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    
    try {
      const response = await fetch('/api/discord/rules-announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          channelId: '1486293985843482774'
        }),
      });

      if (response.ok) {
        setMessage('');
        alert('Rules announcement sent successfully to Discord!');
      } else {
        alert('Failed to send announcement. Please try again.');
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      alert('Error sending announcement. Please check console.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="card-glass p-6">
          <h1 className="mb-6 text-2xl font-bold text-white">Discord Announcement Panel</h1>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                Announcement Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your rules announcement or tournament update..."
                className="w-full h-32 p-3 rounded-lg border border-white/10 bg-white/5 text-slate-200 placeholder-slate-400 focus:border-emerald-400/30 focus:bg-emerald-500/5 focus:text-white resize-none"
                rows={4}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={sendRulesAnnouncement}
                disabled={isSending}
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:from-emerald-600 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[120px]"
              >
                {isSending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-transparent animate-spin rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5 5M13 17l5 5 5-5 5z" />
                    </svg>
                    Send to Discord
                  </div>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                <h3 className="font-semibold text-white mb-2">📋 Configuration</h3>
                <div className="text-sm text-slate-300 space-y-2">
                  <p>
                    <span className="font-semibold text-white">Discord Channel:</span> <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400">1486293985843482774</code>
                  </p>
                  <p className="text-xs text-slate-400">
                    Announcements will be sent to this channel with professional formatting and tournament details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
