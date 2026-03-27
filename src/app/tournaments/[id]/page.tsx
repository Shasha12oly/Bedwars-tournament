'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { getTournament, getTeams, getTeamCount } from '@/lib/firebase-database';

interface Tournament {
  id: string;
  name: string;
  format: 'Solo' | 'Duo' | 'rbw 4v4';
  date: string;
  time: string;
  slots: number;
  registered: number;
  status: 'open' | 'closed' | 'ongoing';
  prize: string;
  description: string;
  rules: string[];
  schedule: { time: string; event: string }[];
}

export default function TournamentDetails({ params, searchParams }: { 
  params: Promise<{ id: string }>; 
  searchParams: Promise<{ registered?: string }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  
  console.log('TournamentDetails component rendered with params:', resolvedParams);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'schedule' | 'bracket' | 'teams'>('overview');
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isRegistered = resolvedSearchParams.registered === 'true';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const tournamentId = resolvedParams.id;
        console.log('Loading tournament details for ID:', tournamentId);
        
        // Get tournament and teams from Firebase
        const [tournamentData, teamsData] = await Promise.all([
          getTournament(tournamentId),
          getTeams(tournamentId)
        ]);
        
        if (tournamentData) {
          const teamCount = await getTeamCount(tournamentId);
          setTournament({
            ...tournamentData,
            slots: tournamentData.maxSlots,
            registered: teamCount,
            status: teamCount >= tournamentData.maxSlots ? 'closed' : tournamentData.status
          });
          setTeams(teamsData);
        } else {
          console.error('Tournament not found');
        }
      } catch (error) {
        console.error('Error loading tournament data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [resolvedParams.id]); // Add dependency array to prevent infinite loops

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-emerald-500/20 text-emerald-400';
      case 'closed': return 'bg-red-500/20 text-red-400';
      case 'ongoing': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Solo': return '⚔️';
      case 'Duo': return '👥';
      case 'rbw 4v4': return '🛡️';
      default: return '🎮';
    }
  };

  if (loading) {
    return (
      <div className="pb-bottom-nav md:pb-0 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">Loading tournament...</div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="pb-bottom-nav md:pb-0 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Tournament Not Found</h1>
            <p className="text-slate-400 mb-6">The tournament you're looking for doesn't exist.</p>
            <Link href="/tournaments" className="btn-gradient px-6 py-3 rounded-lg">
              Back to Tournaments
            </Link>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="pb-bottom-nav md:pb-0 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-8">
          
          {/* Success Message */}
          {isRegistered && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <div>
                  <h3 className="text-emerald-400 font-medium">Registration Successful!</h3>
                  <p className="text-slate-300 text-sm">You're registered for {tournament.name}. Check your email for confirmation.</p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <section className="mb-8">
            <Link 
              href="/tournaments"
              className="text-emerald-400 hover:text-emerald-300 transition-colors mb-4 inline-block"
            >
              ← Back to Tournaments
            </Link>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">{tournament.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-2xl">{getFormatIcon(tournament.format)}</span>
                  <span className="text-emerald-400 font-medium">{tournament.format}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {(tournament.status === 'open' || tournament.status === 'upcoming') && !isRegistered && tournament.registered < tournament.slots && (
                  <Link 
                    href={`/tournaments/${resolvedParams.id}/register`}
                    className="btn-gradient px-6 py-3 rounded-lg font-medium"
                  >
                    Register Now
                  </Link>
                )}
                {tournament.registered >= tournament.slots && !isRegistered && (
                  <button 
                    disabled
                    className="px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium cursor-not-allowed"
                  >
                    Registration Closed
                  </button>
                )}
                {isRegistered && (
                  <button 
                    disabled
                    className="px-6 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium cursor-not-allowed"
                  >
                    ✓ Registered
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Quick Info */}
          <section className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="card-glass p-4">
              <div className="text-sm text-slate-400 mb-1">Date & Time</div>
              <div className="text-white font-medium">{tournament.date}</div>
              <div className="text-slate-300">{tournament.time}</div>
            </div>
            <div className="card-glass p-4 bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-400 text-xl">🏆</span>
                <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Prize Pool</div>
              </div>
              <div className="space-y-2">
                {tournament.prizePool ? tournament.prizePool.split('\n').map((prize: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-emerald-400 text-sm mt-0.5">✦</span>
                    <span className="text-white text-sm leading-relaxed">{prize.trim()}</span>
                  </div>
                )) : (
                  <div className="text-slate-400 text-sm">No prize information</div>
                )}
              </div>
            </div>
            <div className="card-glass p-4">
              <div className="text-sm text-slate-400 mb-1">Slots Available</div>
              <div className="text-white font-medium">{tournament.registered}/{tournament.slots}</div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${(tournament.registered / tournament.slots) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="card-glass p-4">
              <div className="text-sm text-slate-400 mb-1">Server</div>
              <div className="text-white font-medium">mc.hellcore.net</div>
              <div className="text-slate-300 text-sm">mc.hellcore.net</div>
            </div>
          </section>

          {/* Tabs */}
          <section className="mb-8">
            <div className="flex flex-wrap gap-2 border-b border-white/10">
              {['overview', 'rules', 'schedule', 'bracket', 'teams'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-3 font-medium transition-all duration-300 border-b-2 ${
                    activeTab === tab
                      ? 'text-emerald-400 border-emerald-400'
                      : 'text-slate-400 border-transparent hover:text-slate-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* Tab Content */}
          <section className="card-glass p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Tournament Overview</h2>
                <p className="text-slate-300 leading-relaxed mb-6">{tournament.description}</p>
                
                <h3 className="text-xl font-semibold text-white mb-3">How to Participate</h3>
                <ol className="space-y-2 text-slate-300">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">1</span>
                    <span>Register for the tournament using the form above</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">2</span>
                    <span>Join the Discord server for updates and announcements</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">3</span>
                    <span>Be online at least 30 minutes before the tournament starts</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">4</span>
                    <span>Follow the bracket and play your matches</span>
                  </li>
                </ol>
              </div>
            )}

            {activeTab === 'rules' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Tournament Rules</h2>
                <div className="space-y-3">
                  {tournament.rules?.map((rule: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span className="text-slate-300">{rule}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                  <h3 className="text-amber-400 font-semibold mb-2">⚠️ Important</h3>
                  <p className="text-slate-300 text-sm">
                    Rule violations will result in immediate disqualification. Admin decisions are final.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Tournament Schedule</h2>
                <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                  <p className="text-emerald-400 text-sm font-medium">
                    🕐 Tournament runs from <strong>2:00 PM</strong> to <strong>9:00 PM</strong>
                  </p>
                  <p className="text-slate-300 text-xs mt-1">
                    All matches will be conducted between these hours
                  </p>
                </div>
                <div className="space-y-3">
                  {tournament.schedule?.map((item: { time: string; event: string }, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                      <div className="text-emerald-400 font-medium min-w-[80px]">{item.time}</div>
                      <div className="text-slate-300">{item.event}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <h3 className="text-blue-400 font-semibold mb-2">ℹ️ Time Zone</h3>
                  <p className="text-slate-300 text-sm">
                    All times are in your local time zone. Please double-check the tournament start time.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'teams' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Registered Teams ({teams.length}/{tournament?.slots || 0})</h2>
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No teams have registered yet. Be the first to join!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {teams?.map((team) => (
                    <div key={team.id} className="card-glass p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                          {team.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Captain:</span>
                          <span className="text-white font-medium">{team.captain}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Discord:</span>
                          <span className="text-slate-300">{team.discord}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Members:</span>
                          <div className="mt-1 space-y-1">
                            {team.members?.map((member: string, index: number) => (
                              <div key={index} className="text-slate-300">
                                • {member}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Registered:</span>
                          <span className="text-slate-300">
                            {new Date(team.registeredAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {tournament && teams.length >= tournament.slots && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <h3 className="text-red-400 font-semibold mb-2">🔒 Registration Full</h3>
                  <p className="text-slate-300 text-sm">
                    All {tournament.slots} team slots have been filled. Registration is now closed.
                  </p>
                </div>
              )}
              
              {tournament && teams.length < tournament.slots && (
                <div className="mt-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                  <h3 className="text-amber-400 font-semibold mb-2">Slots Available</h3>
                  <p className="text-slate-300 text-sm">
                    {tournament.slots - teams.length} team slots remaining. Register your rbw 4v4 team now!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bracket' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Tournament Bracket</h2>
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">🏆</span>
                  <h3 className="text-xl font-semibold text-white mb-2">Live Tournament Bracket</h3>
                  <p className="text-slate-400 mb-4">
                    View the complete tournament bracket with all rounds and matchups.
                  </p>
                  <Link 
                    href={`/tournaments/${resolvedParams.id}/rounds`}
                    className="btn-gradient inline-flex min-h-[44px] items-center justify-center px-6 py-3"
                  >
                    View Full Bracket
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
}
