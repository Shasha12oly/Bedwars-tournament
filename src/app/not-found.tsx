'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

export default function NotFound() {
  return (
    <div className="pb-bottom-nav md:pb-0 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 text-center">
          <div className="card-glass p-8 md:p-12">
            <span className="text-6xl mb-6 block">🎮</span>
            <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
              Oops! The page you're looking for seems to have been lost in the BedWars arena.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/"
                className="btn-gradient inline-flex min-h-[44px] items-center justify-center px-6 py-3"
              >
                Go Home
              </Link>
              <Link 
                href="/tournaments"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium text-slate-200 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 min-h-[44px] inline-flex items-center justify-center"
              >
                View Tournaments
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
}
