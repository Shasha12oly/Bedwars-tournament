'use client';

import Link from 'next/link';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/10 bg-[#0b1220]/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Mobile navigation">
      <Link className="flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-3 transition-colors duration-200 rounded-lg bg-emerald-500/20 text-emerald-400" aria-current="page" href="/">
        <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span className="text-xs font-medium truncate max-w-[72px]">Home</span>
      </Link>
      <Link className="flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-3 transition-colors duration-200 text-slate-400 active:bg-white/5" href="/tournaments">
        <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>
        <span className="text-xs font-medium truncate max-w-[72px]">Tournaments</span>
      </Link>
      <Link className="flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-3 transition-colors duration-200 text-slate-400 active:bg-white/5" href="/matches">
        <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <rect x="6" y="3" width="9" height="18" rx="2"></rect>
          <line x1="10" y1="8" x2="10" y2="8"></line>
        </svg>
        <span className="text-xs font-medium truncate max-w-[72px]">Matches</span>
      </Link>
      <Link className="flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-3 transition-colors duration-200 text-slate-400 active:bg-white/5" href="/database-status">
        <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 11H3v2h6v-2zm0-4H3v2h6V7zm0 8H3v2h6v-2zm12-8h-6v2h6V7zm0 4h-6v2h6v-2z"></path>
        </svg>
        <span className="text-xs font-medium truncate max-w-[72px]">Status</span>
      </Link>
      <Link className="flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-3 transition-colors duration-200 text-slate-400 active:bg-white/5" href="/bot-test">
        <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 11H3v2h6v-2zm0-4H3v2h6V7zm0 8H3v2h6v-2zm12-8h-6v2h6V7zm0 4h-6v2h6v-2z"></path>
        </svg>
        <span className="text-xs font-medium truncate max-w-[72px]">Bot Test</span>
      </Link>
    </nav>
  );
}
