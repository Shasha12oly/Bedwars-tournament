'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import TournamentBracket from '@/components/TournamentBracket';
import { getTournamentsFromDatabase, getTeamsFromDatabase, getTeamCountFromDatabase } from '@/lib/tournament-storage';

interface Tournament {
  id: string;
  name: string;
  format: string;
  date: string;
  time: string;
  max_slots: number;
  registered: number;
  status: string;
  prize_pool: string;
  rules: string[];
  schedule: { time: string; event: string }[];
  created_at: string;
  updated_at: string;
}

export default function TournamentDetails({ params, searchParams }: { 
  params: Promise<{ id: string }>; 
  searchParams: Promise<{ registered?: string; autoClosed?: string; bracketGenerated?: string }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showAutoClosedMessage, setShowAutoClosedMessage] = useState(false);
  const [showBracketGeneratedMessage, setShowBracketGeneratedMessage] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const tournamentId = resolvedParams.id;
        console.log('Loading tournament details for ID:', tournamentId);
        
        // Get teams data from server API
        const [teamsResponse, tournamentsResponse] = await Promise.all([
          fetch('/api/teams'),
          fetch('/api/tournaments')
        ]);
        
        const allTeams = await teamsResponse.json();
        const allTournaments = await tournamentsResponse.json();
        
        const tournamentData = allTournaments.find((t: any) => t.id === tournamentId);
        const teamsData = allTeams.filter((team: any) => team.tournament_id === tournamentId);
        const teamCount = tournamentData?.currentTeams || teamsData.length;
        
        console.log('Tournament data loaded:', tournamentData.name, 'Teams:', teamCount);
        
        if (!tournamentData) {
          console.log('Tournament not found in database');
          setLoading(false);
          return;
        }
        
        // Parse JSON fields from database
        const parsedTournament = {
          ...tournamentData,
          registered: teamCount,
          slots: tournamentData.max_slots,  // Fix: use max_slots from database
          status: teamCount >= tournamentData.max_slots ? 'closed' : tournamentData.status,
          rules: typeof tournamentData.rules === 'string' ? JSON.parse(tournamentData.rules) : tournamentData.rules,
          schedule: typeof tournamentData.schedule === 'string' ? JSON.parse(tournamentData.schedule) : tournamentData.schedule
        };
        
                
        setTournament(parsedTournament);
        setTeams(teamsData);
        
        // Check if user just registered
        if (resolvedSearchParams.registered === 'true') {
          setShowSuccessMessage(true);
          // Check if registration was auto-closed
          if (resolvedSearchParams.autoClosed === 'true') {
            setShowAutoClosedMessage(true);
            // Check if bracket was also generated
            if (resolvedSearchParams.bracketGenerated === 'true') {
              setShowBracketGeneratedMessage(true);
              // Hide bracket generated message after 10 seconds (longest for special message)
              setTimeout(() => setShowBracketGeneratedMessage(false), 10000);
            }
            // Hide auto-closed message after 8 seconds (longer for special message)
            setTimeout(() => setShowAutoClosedMessage(false), 8000);
          }
          // Hide success message after 5 seconds
          setTimeout(() => setShowSuccessMessage(false), 5000);
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
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-xl">🎉</span>
                <div>
                  <h3 className="text-emerald-400 font-medium">Registration Successful!</h3>
                  <p className="text-slate-300 text-sm">Your team has been registered for {tournament.name}. Check the Teams tab to see your registration!</p>
                </div>
              </div>
            </div>
          )}

          {/* Auto-Closure Message */}
          {showAutoClosedMessage && (
            <div className="mb-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 text-xl">🏁</span>
                <div>
                  <h3 className="text-amber-400 font-medium">Tournament Now Full!</h3>
                  <p className="text-slate-300 text-sm">Registration has automatically closed since all slots are filled. Tournament organizers can now generate the bracket!</p>
                </div>
              </div>
            </div>
          )}

          {/* Bracket Generated Message */}
          {showBracketGeneratedMessage && (
            <div className="mb-6 p-6 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-xl animate-pulse">
              <div className="flex items-center gap-3">
                <div className="mt-6 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                  <h3 className="text-emerald-400 font-bold text-lg">Tournament Bracket Ready!</h3>
                  <p className="text-slate-300 text-sm">The tournament bracket has been automatically generated! View the complete bracket in the Bracket tab above.</p>
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
                {tournament.prize_pool ? tournament.prize_pool.split('\n').map((prize: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg border border-amber-500/20">
                    <span className="text-yellow-400 text-lg">{prize.trim().split(' ')[0]}</span>
                    <span className="text-white text-sm leading-relaxed font-medium">{prize.trim().split(' ').slice(1).join(' ')}</span>
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
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">{tournament.name}</h1>
                  <p className="text-slate-400">{tournament.description}</p>
                </div>  
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
                  {tournament.rules && Array.isArray(tournament.rules) ? (
                    tournament.rules.map((rule: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span className="text-slate-300">{rule}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400">No rules available</div>
                  )}
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
                  {tournament.schedule && Array.isArray(tournament.schedule) ? (
                    tournament.schedule.map((item: { time: string; event: string }, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                        <div className="text-emerald-400 font-medium min-w-[120px]">{item.time}</div>
                        <div className="text-slate-300">{item.event}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400">No schedule available</div>
                  )}
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
                            {team.registered_at ? new Date(team.registered_at).toLocaleDateString() : 'Unknown'}
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
              <TournamentBracket tournamentId={resolvedParams.id} tournamentStatus={tournament?.status} />
            )}
          </section>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
}
