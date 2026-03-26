'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Rules() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-4 py-16 text-center sm:px-6 sm:py-20">
          <div className="relative z-10">
            <div className="backdrop-blur-sm bg-slate-900/40 rounded-2xl p-8 max-w-4xl mx-auto">
              <p className="text-sm font-medium uppercase tracking-widest text-emerald-400/90 sm:text-base">
                Ranked BedWars Rules
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                Competitive. Fair. Balanced.
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-base text-slate-200 sm:mt-4 sm:text-lg md:text-xl">
                Complete ruleset for our ranked BedWars tournaments. Follow these guidelines to ensure fair play and avoid disqualification.
              </p>
            </div>
          </div>
        </section>

        {/* Rules Content */}
        <section className="relative z-20 px-4 py-8 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Always Allowed */}
              <div className="card-glass-dark p-6">
                <h2 className="mb-4 text-xl font-bold text-emerald-400">Always Allowed</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Ladders</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Sponges</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Diamond Sword</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Blue Side Base</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Fireballs — No Fireballs at Diamond Tier 1</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Water — Use only within your own base</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Diamond Armor — Maximum: 2 players per team</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Bridge Eggs — Allowed</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* After Beds Destroyed */}
              <div className="card-glass-dark p-6">
                <h2 className="mb-4 text-xl font-bold text-orange-400">After Beds Destroyed</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">TNT</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Iron Golems</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Ender Pearl</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">All Side Bases</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Water [Anywhere]</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Knockback Sticks</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Invincibility Star</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Invisibility Potion</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Speed + Jump Potion</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Diamond Armor [No Limit]</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Never Allowed */}
              <div className="card-glass-dark p-6">
                <h2 className="mb-4 text-xl font-bold text-red-400">Never Allowed</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💀</span>
                    <div>
                      <div className="font-semibold text-white">Pop-up Towers</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💀</span>
                    <div>
                      <div className="font-semibold text-white">Obsidian</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💀</span>
                    <div>
                      <div className="font-semibold text-white">Bow & Arrows</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💀</span>
                    <div>
                      <div className="font-semibold text-white">Fireballing Diamonds</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💀</span>
                    <div>
                      <div className="font-semibold text-white">silver fishes are also allowed and now other rules</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💀</span>
                    <div>
                      <div className="font-semibold text-white">No hacks, mods, macros, auto-clickers, or unfair advantages</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💀</span>
                    <div>
                      <div className="font-semibold text-white">No glitch abusing or stream sniping</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💀</span>
                    <div>
                      <div className="font-semibold text-white">Only allowed clients/mods as per posted tournament rules</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* General Rules */}
              <div className="card-glass-dark p-6">
                <h2 className="mb-4 text-xl font-bold text-blue-400">General Rules</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <div className="font-semibold text-white">Team members must remain the same throughout the tournament</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">👤</span>
                    <div>
                      <div className="font-semibold text-white">One Minecraft account and one Discord per player — no smurfing or shared accounts</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="font-semibold text-white">Respect all players and staff — toxicity or abuse is not tolerated</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⏰</span>
                    <div>
                      <div className="font-semibold text-white">Be on time for matches; only registered players are allowed</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚖️</span>
                    <div>
                      <div className="font-semibold text-white">Admin and staff decisions are final</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⛔</span>
                    <div>
                      <div className="font-semibold text-red-400">Rule break = immediate disqualification</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
