'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Discord Banner Above Navigation */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-2 px-4 text-sm font-medium">
        <span className="flex items-center justify-center gap-2">
          🎮 Join our Discord server for updates and announcements! 
          <Link 
            href="https://discord.gg/CHzVbuVp" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-purple-600 px-3 py-1 rounded ml-2 font-bold hover:bg-purple-50 transition-colors"
          >
            Join Now
          </Link>
        </span>
      </div>
      
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
          
          {/* Desktop Navigation */}
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

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:bg-white/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl">
            <div className="px-3 py-4 space-y-2">
              <Link 
                className="block rounded-lg px-4 py-3 text-base font-medium transition-all duration-300 text-slate-400 hover:bg-white/10 hover:text-slate-100"
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🏠 Home
              </Link>
              <Link 
                className="block rounded-lg px-4 py-3 text-base font-medium transition-all duration-300 text-slate-400 hover:bg-white/10 hover:text-slate-100"
                href="/tournaments"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🏆 Tournaments
              </Link>
              <Link 
                className="block rounded-lg px-4 py-3 text-base font-medium transition-all duration-300 text-slate-400 hover:bg-white/10 hover:text-slate-100"
                href="/matches"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🎮 Matches
              </Link>
              <Link 
                className="block rounded-lg px-4 py-3 text-base font-medium transition-all duration-300 text-slate-400 hover:bg-white/10 hover:text-slate-100"
                href="/rules"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📋 Rules
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
