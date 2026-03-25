'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import HostTicker from '@/components/HostTicker';

export default function Home() {
  return (
    <div className="pb-bottom-nav md:pb-0 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="min-h-screen">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-12 lg:py-16">
          
          {/* Hero Section */}
          <section className="relative mb-12 min-h-[520px] px-4 py-8 text-center sm:px-6 sm:py-10 md:mb-20 md:px-10 md:py-12 lg:px-16 lg:py-14 flex items-center justify-center">
            {/* Minecraft Summer Themed Video Background */}
            <div className="absolute inset-0 left-1/2 w-screen -translate-x-1/2 -z-10 overflow-hidden">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-70"
                style={{
                  filter: 'contrast(1.1) saturate(1.2) brightness(0.9)'
                }}
              >
                <source src="/minecraft-games-bg.mp4" type="video/mp4" />
              </video>
            </div>
            
            <div className="relative z-10 w-full">
              <div className="backdrop-blur-sm bg-slate-900/40 rounded-2xl p-8 max-w-4xl mx-auto">
                <p className="mx-auto inline-flex items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200 sm:text-sm">
                  Mcfleet X HellCore · BedWars Tournaments
                </p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                  Compete. Dominate. Conquer.
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200/95 sm:text-lg md:text-xl">
                  Step into the ultimate BedWars battleground. Form your team and clash in high-stakes tournaments — Solo, Duo, or rbw 4v4.
                </p>
                <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-relaxed text-white sm:text-lg md:text-xl">
                  Protect your bed. Destroy your enemies. Rise to victory.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
                  <div>
                    <Link className="btn-gradient inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-5 py-3" href="/tournaments">
                      Register Now
                    </Link>
                  </div>
                  <div>
                    <Link className="rounded-full border border-white/20 bg-white/15 backdrop-blur-md px-5 py-3 font-medium text-slate-200 transition-all duration-300 hover:scale-[1.02] hover:bg-white/25 min-h-[44px] inline-flex items-center justify-center" href="/tournaments">
                      View Tournaments
                    </Link>
                  </div>
                  <div>
                    <a href="https://discord.gg/qGJhX8XA" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 bg-white/15 backdrop-blur-md px-5 py-3 font-medium text-slate-200 transition-all duration-300 hover:scale-[1.02] hover:bg-white/25 min-h-[44px] inline-flex items-center justify-center">
                      Join Discord
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Host Ticker */}
          <HostTicker />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
