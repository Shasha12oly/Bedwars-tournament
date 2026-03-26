'use client';

import { useState, useEffect } from 'react';

interface Host {
  id: string;
  username: string;
  displayName: string;
}

export default function HostTicker() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHosts() {
      try {
        const res = await fetch('/api/discord/hosts');
        if (res.ok) {
          const data = await res.json();
          setHosts(data.hosts || []);
        }
      } catch (error) {
        console.error('Failed to fetch hosts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHosts();
  }, []);

  if (loading || hosts.length === 0) {
    return null;
  }

  // Create ticker items (duplicate 4 times for seamless loop with no gaps)
  const tickerItems = [...hosts, ...hosts, ...hosts, ...hosts];

  return (
    <div className="relative flex-1 overflow-hidden bg-slate-800/60 py-3 mb-12 rounded-2xl border border-white/10 shadow-lg">
      <div className="flex items-center gap-4 px-6">
        <span className="inline-flex items-center rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-900">Host</span>
        <div className="flex-1 overflow-hidden">
          <div className="ticker-track flex w-max gap-8 whitespace-nowrap animate-scroll group hover:[animation-play-state:paused]">
            {tickerItems.map((host, index) => (
              <span key={`${host.id}-${index}`} className="inline-flex items-center gap-1">
                <span className="text-amber-400">🔥</span>
                <span className="text-slate-200 font-medium">{host.displayName}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
