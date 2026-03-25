'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/90 shadow-lg backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3 md:px-8" aria-label="Main">
        <Link className="flex items-center gap-2 text-base font-bold tracking-tight accent-gradient transition-all duration-300 hover:opacity-90 sm:text-lg min-w-0 truncate" href="/">
          <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden flex items-center justify-center sm:h-12 sm:w-12">
            <img 
              src="/Bedwars__battle_of_flames_and_darkness.png" 
              alt="BedWars Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="truncate">BedWars Tournament</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden md:flex items-center gap-1">
            <Link className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 text-slate-400 hover:bg-white/10 hover:text-slate-100" href="/">
              Home
            </Link>
            <Link className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 text-slate-400 hover:bg-white/10 hover:text-slate-100" href="/tournaments">
              Tournaments
            </Link>
            <Link className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 text-slate-400 hover:bg-white/10 hover:text-slate-100" href="/matches">
              Matches
            </Link>
            <Link className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 text-slate-400 hover:bg-white/10 hover:text-slate-100" href="/rules">
              Rules
            </Link>
          </div>
          <span className="ml-2 text-sm text-slate-400">…</span>
        </div>
      </nav>
    </header>
  );
}
