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

          {/* Stop video background after hero section */}
          <div className="relative z-20">
            {/* Features Section */}
          <section className="mb-10 sm:mb-16 md:mb-20 overflow-hidden">
            <div className="px-1 sm:px-0">
              <h2 className="text-xl font-semibold text-white sm:text-2xl md:text-3xl">What Awaits You</h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-400 sm:text-base">
                Everything here is built for competitive BedWars — quick events, clear rules, and a community that plays hard and stays respectful.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                <div className="card-glass-dark group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true">
                    <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/15 blur-2xl"></div>
                  </div>
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl">
                      <span aria-hidden="true">🎮</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Active matches</div>
                      <div className="mt-1 text-sm text-slate-300">Active matches &amp; custom events</div>
                    </div>
                  </div>
                </div>

                <div className="card-glass-dark group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true">
                    <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-amber-500/15 blur-2xl"></div>
                  </div>
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl">
                      <span aria-hidden="true">🏆</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Real competition</div>
                      <div className="mt-1 text-sm text-slate-300">Competitive tournaments &amp; rewards</div>
                    </div>
                  </div>
                </div>

                <div className="card-glass-dark group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true">
                    <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-sky-500/15 blur-2xl"></div>
                  </div>
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl">
                      <span aria-hidden="true">🤝</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Good vibes</div>
                      <div className="mt-1 text-sm text-slate-300">Friendly but competitive community</div>
                    </div>
                  </div>
                </div>

                <div className="card-glass-dark group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true">
                    <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-violet-500/15 blur-2xl"></div>
                  </div>
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl">
                      <span aria-hidden="true">🛡️</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Fair play</div>
                      <div className="mt-1 text-sm text-slate-300">Fair play &amp; supportive staff</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Rules Section */}
          <section className="mb-10 sm:mb-16 md:mb-20">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white sm:mb-6 sm:text-2xl md:text-3xl">Tournament Rules</h2>
              <p className="mb-6 max-w-3xl text-sm text-slate-400 sm:text-base">
                Fair play ensures fun for everyone. Follow these guidelines to avoid disqualification and keep the competition balanced.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <div className="card-glass-dark flex items-center gap-3 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <span className="text-2xl" aria-hidden="true">✅</span>
                  <div className="text-sm font-medium text-slate-200 text-center">
                    <div className="font-semibold">No Hacking</div>
                    <div className="text-xs text-slate-400">Fair play only</div>
                  </div>
                </div>
                <div className="card-glass-dark flex items-center gap-3 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <span className="text-2xl" aria-hidden="true">👥</span>
                  <div className="text-sm font-medium text-slate-200 text-center">
                    <div className="font-semibold">Team Consistency</div>
                    <div className="text-xs text-slate-400">Same roster throughout</div>
                  </div>
                </div>
                <div className="card-glass-dark flex items-center gap-3 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <span className="text-2xl" aria-hidden="true">⏰</span>
                  <div className="text-sm font-medium text-slate-200 text-center">
                    <div className="font-semibold">On Time</div>
                    <div className="text-xs text-slate-400">Be ready for matches</div>
                  </div>
                </div>
                <div className="card-glass-dark flex items-center gap-3 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <span className="text-2xl" aria-hidden="true">💀</span>
                  <div className="text-sm font-medium text-slate-200 text-center">
                    <div className="font-semibold">No Advantages</div>
                    <div className="text-xs text-slate-400">No unfair play</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link 
                  href="/rules" 
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:from-emerald-600 hover:to-emerald-500 hover:scale-105 shadow-lg"
                >
                  View Complete Rules
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5 5M13 17l5 5 5-5 5z" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>

          {/* Where do we play */}
          <section className="mb-10 sm:mb-16 md:mb-20">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white sm:mb-6 sm:text-2xl md:text-3xl bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">Where do we play</h2>
              <p className="mb-8 max-w-3xl text-sm text-slate-400 sm:text-base">
                Join our official BedWars servers for competitive tournaments and daily matches. Both servers run on 1.8.9 for classic gameplay.
              </p>
              <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
                {/* MCFleet Server Card */}
                <div className="group relative">
                  {/* Animated gradient border */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-emerald-600/20 rounded-2xl opacity-0 blur transition-all duration-500 group-hover:opacity-100"></div>
                  <div className="card-glass-dark relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-950/30 via-slate-900/40 to-emerald-900/20 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-emerald-400/40 sm:p-8">
                    {/* Animated background particles */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true">
                      <div className="absolute -left-8 -top-8 h-16 w-16 rounded-full bg-emerald-400/20 blur-xl animate-pulse"></div>
                      <div className="absolute -right-8 -bottom-8 h-20 w-20 rounded-full bg-emerald-500/15 blur-2xl animate-pulse delay-75"></div>
                      <div className="absolute left-1/4 top-1/4 h-12 w-12 rounded-full bg-emerald-300/10 blur-lg animate-pulse delay-150"></div>
                    </div>
                    
                    <div className="relative">
                      {/* Server Header */}
                      <div className="mb-6 flex items-center gap-4">
                        <div className="relative group/logo">
                          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-xl opacity-0 blur transition-all duration-300 group-hover/logo:opacity-75"></div>
                          <img 
                            src="/mcfleet.webp" 
                            alt="MCFleet Logo" 
                            className="relative h-16 w-16 rounded-xl object-cover ring-2 ring-emerald-400/30 transition-transform duration-300 group-hover/logo:scale-110"
                          />
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 ring-2 ring-slate-900 animate-pulse"></div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">MCFleet</h3>
                          <p className="text-sm font-semibold text-emerald-400">BedWars Server</p>
                        </div>
                      </div>
                      
                      {/* Server Stats */}
                      <div className="mb-6 grid grid-cols-3 gap-2">
                        <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-2 text-center">
                          <div className="text-lg font-bold text-emerald-300">24/7</div>
                          <div className="text-xs text-emerald-400/80">Online</div>
                        </div>
                        <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-2 text-center">
                          <div className="text-lg font-bold text-emerald-300">1.8.9</div>
                          <div className="text-xs text-emerald-400/80">Version</div>
                        </div>
                        <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-2 text-center">
                          <div className="text-lg font-bold text-emerald-300">2000+</div>
                          <div className="text-xs text-emerald-400/80">Players</div>
                        </div>
                      </div>
                      
                      {/* Server Details */}
                      <div className="space-y-4">
                        <div className="group/ip rounded-xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 p-4 transition-all duration-300 hover:border-emerald-400/40 hover:from-emerald-500/15 hover:to-emerald-600/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-emerald-300">Server IP</div>
                              <div className="text-xs text-emerald-400/80">Click to copy</div>
                            </div>
                            <button 
                              type="button" 
                              className="rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-mono font-medium text-emerald-200 hover:bg-emerald-500/30 transition-all duration-200 group-hover/ip:scale-105"
                              title="Click to copy server IP"
                            >
                              mcfleet.net
                            </button>
                          </div>
                        </div>
                        
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-lg">⚔️</span>
                            <span className="text-sm font-semibold text-slate-200">Game Version</span>
                          </div>
                          <div className="text-sm text-slate-300">1.8.9 Classic BedWars Experience</div>
                        </div>
                        
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-lg">🎮</span>
                            <span className="text-sm font-semibold text-slate-200">Server Features</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="text-emerald-400 text-xs">◆</span>
                              <span>Custom Maps</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="text-emerald-400 text-xs">◆</span>
                              <span>Daily Events</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="text-emerald-400 text-xs">◆</span>
                              <span>Ranked Play</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="text-emerald-400 text-xs">◆</span>
                              <span>Active Staff</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hellcore Server Card */}
                <div className="group relative">
                  {/* Animated gradient border */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 via-red-400/10 to-red-600/20 rounded-2xl opacity-0 blur transition-all duration-500 group-hover:opacity-100"></div>
                  <div className="card-glass-dark relative overflow-hidden rounded-2xl border border-red-400/20 bg-gradient-to-br from-red-950/30 via-slate-900/40 to-red-900/20 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-red-400/40 sm:p-8">
                    {/* Animated background particles */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true">
                      <div className="absolute -left-8 -top-8 h-16 w-16 rounded-full bg-red-400/20 blur-xl animate-pulse"></div>
                      <div className="absolute -right-8 -bottom-8 h-20 w-20 rounded-full bg-red-500/15 blur-2xl animate-pulse delay-75"></div>
                      <div className="absolute left-1/4 top-1/4 h-12 w-12 rounded-full bg-red-300/10 blur-lg animate-pulse delay-150"></div>
                    </div>
                    
                    <div className="relative">
                      {/* Server Header */}
                      <div className="mb-6 flex items-center gap-4">
                        <div className="relative group/logo">
                          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-red-400 rounded-xl opacity-0 blur transition-all duration-300 group-hover/logo:opacity-75"></div>
                          <img 
                            src="/hellcore.webp" 
                            alt="Hellcore Logo" 
                            className="relative h-16 w-16 rounded-xl object-cover ring-2 ring-red-400/30 transition-transform duration-300 group-hover/logo:scale-110"
                          />
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-400 to-red-500 ring-2 ring-slate-900 animate-pulse"></div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">Hellcore</h3>
                          <p className="text-sm font-semibold text-red-400">BedWars Server</p>
                        </div>
                      </div>
                      
                      {/* Server Stats */}
                      <div className="mb-6 grid grid-cols-3 gap-2">
                        <div className="rounded-lg border border-red-400/20 bg-red-500/10 p-2 text-center">
                          <div className="text-lg font-bold text-red-300">24/7</div>
                          <div className="text-xs text-red-400/80">Online</div>
                        </div>
                        <div className="rounded-lg border border-red-400/20 bg-red-500/10 p-2 text-center">
                          <div className="text-lg font-bold text-red-300">1.8.9</div>
                          <div className="text-xs text-red-400/80">Version</div>
                        </div>
                        <div className="rounded-lg border border-red-400/20 bg-red-500/10 p-2 text-center">
                          <div className="text-lg font-bold text-red-300">30+</div>
                          <div className="text-xs text-red-400/80">Players</div>
                        </div>
                      </div>
                      
                      {/* Server Details */}
                      <div className="space-y-4">
                        <div className="group/ip rounded-xl border border-red-400/20 bg-gradient-to-r from-red-500/10 to-red-600/5 p-4 transition-all duration-300 hover:border-red-400/40 hover:from-red-500/15 hover:to-red-600/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-red-300">Server IP</div>
                              <div className="text-xs text-red-400/80">Click to copy</div>
                            </div>
                            <button 
                              type="button" 
                              className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-mono font-medium text-red-200 hover:bg-red-500/30 transition-all duration-200 group-hover/ip:scale-105"
                              title="Click to copy server IP"
                            >
                              mc.hellcore.net
                            </button>
                          </div>
                        </div>
                        
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-lg">🛡️</span>
                            <span className="text-sm font-semibold text-slate-200">Game Version</span>
                          </div>
                          <div className="text-sm text-slate-300">1.8.9 Classic BedWars Experience</div>
                        </div>
                        
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-lg">⚡</span>
                            <span className="text-sm font-semibold text-slate-200">Server Features</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="text-red-400 text-xs">◆</span>
                              <span>Pro PvP</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="text-red-400 text-xs">◆</span>
                              <span>Weekly Cups</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="text-red-400 text-xs">◆</span>
                              <span>Ranked S2</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="text-red-400 text-xs">◆</span>
                              <span>Elite Staff</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tournament Formats */}
          <section className="mb-10 sm:mb-16 md:mb-20">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white sm:mb-6 sm:text-2xl md:text-3xl">Tournament formats</h2>
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
                <div className="card-glass p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
                  <span className="text-2xl sm:text-3xl" aria-hidden="true">⚔️</span>
                  <h3 className="mt-2 text-lg font-semibold text-white sm:mt-3 sm:text-xl">Solo</h3>
                  <p className="mt-1 text-xs font-medium text-emerald-400">1 player per team</p>
                  <p className="mt-2 text-sm text-slate-400">Every player for themselves. Register with your IGN and fight alone for the crown.</p>
                </div>
                <div className="card-glass p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
                  <span className="text-2xl sm:text-3xl" aria-hidden="true">👥</span>
                  <h3 className="mt-2 text-lg font-semibold text-white sm:mt-3 sm:text-xl">Duo</h3>
                  <p className="mt-1 text-xs font-medium text-emerald-400">2 players per team</p>
                  <p className="mt-2 text-sm text-slate-400">Team up with one partner. Coordinate strategies and share the victory.</p>
                </div>
                <div className="card-glass p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
                  <span className="text-2xl sm:text-3xl" aria-hidden="true">🛡️</span>
                  <h3 className="mt-2 text-lg font-semibold text-white sm:mt-3 sm:text-xl">rbw 4v4</h3>
                  <p className="mt-1 text-xs font-medium text-emerald-400">4 players per team</p>
                  <p className="mt-2 text-sm text-slate-400">Full team of four. Build your roster, assign roles, and dominate as a unit.</p>
                </div>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="mb-10 sm:mb-16 md:mb-20">
            <div>
              <div className="card-glass p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="mb-4 text-xl font-semibold text-white sm:mb-6 sm:text-2xl md:text-3xl">How it works</h2>
                <ol className="space-y-4 text-slate-400">
                  <li className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">1</span>
                    <span><strong className="text-slate-200">Create your team</strong> and start rocking</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">2</span>
                    <span><strong className="text-slate-200">Pick a tournament</strong> from the open events. Choose Solo, Duo, or rbw 4v4 and check the registration deadline.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">3</span>
                    <span><strong className="text-slate-200">Register</strong> — fill in your entry or team details (Solo, Duo, or rbw 4v4) in one form.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">4</span>
                    <span><strong className="text-slate-200">Play your rounds</strong> when the bracket is published. View rounds and matchups from the tournament page.</span>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="mb-10 sm:mb-16 md:mb-20">
            <div>
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
                <div className="card-glass p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
                  <span className="text-2xl sm:text-3xl" aria-hidden="true">🏆</span>
                  <h3 className="mt-2 text-lg font-semibold text-white sm:mt-3 sm:text-xl">Structured Tournament System</h3>
                  <p className="mt-1.5 text-sm text-slate-400 sm:mt-2">Clear brackets, schedules, and rules for every event.</p>
                </div>
                <div className="card-glass p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
                  <span className="text-2xl sm:text-3xl" aria-hidden="true">📊</span>
                  <h3 className="mt-2 text-lg font-semibold text-white sm:mt-3 sm:text-xl">Live Slot Tracking</h3>
                  <p className="mt-1.5 text-sm text-slate-400 sm:mt-2">See remaining spots and registration deadlines in real time.</p>
                </div>
                <div className="card-glass p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
                  <span className="text-2xl sm:text-3xl" aria-hidden="true">🎮</span>
                  <h3 className="mt-2 text-lg font-semibold text-white sm:mt-3 sm:text-xl">Admin Controlled Brackets</h3>
                  <p className="mt-1.5 text-sm text-slate-400 sm:mt-2">Organizers manage rounds and advancement with full control.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="text-center pb-6 sm:pb-0">
            <div>
              <p className="mb-4 text-slate-400 sm:mb-6">Ready to compete? Join Discord for updates and registrations.</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link className="btn-gradient inline-flex min-h-[44px] items-center justify-center px-5 py-3" href="/tournaments">
                  View open tournaments
                </Link>
                <a href="https://discord.gg/qGJhX8XA" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/10 min-h-[44px] inline-flex items-center justify-center">
                  Join Discord
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
      </main>
      
      <Footer />
    </div>
  );
}
