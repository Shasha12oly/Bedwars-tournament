'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getTournament, registerTeam, getTeams, getTeamCount, updateTournament } from '@/lib/firebase-database';

interface Tournament {
  id: string;
  name: string;
  format: 'Solo' | 'Duo' | 'rbw 4v4';
  date: string;
  time: string;
  slots: number;
  registered: number;
  prize: string;
  rules: string[];
}

export default function TournamentRegister({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    displayName: '',
    minecraftIGN: '',
    discord: '',
    teamName: '',
    teammates: ['', '', ''], // For Squad format (3 teammates + captain)
    teammateDiscords: ['', '', ''], // Discord usernames for teammates
    rewardReceiver: 'captain' // Who receives the reward
  });
  const [showTeamSuggestions, setShowTeamSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Cool BedWars team names
  const coolTeamNames = [
    'Bedrock Destroyers', 'Void Walkers', 'Ender Warriors', 'Diamond Rush', 'Emerald Elite',
    'Nether Knights', 'Sky Warriors', 'Block Breakers', 'Craft Masters', 'PvP Legends',
    'Island Conquerors', 'Bed Defenders', 'Crystal Crushers', 'Gold Grabbers', 'Iron Titans',
    'Redstone Rebels', 'Obsidian Order', 'Quartz Queens', 'Lapis Legion', 'Coal Commandos',
    'Gravel Guardians', 'Sand Survivors', 'Dirt Dominators', 'Stone Soldiers', 'Wood Warriors',
    'Creeper Crushers', 'Skeleton Slayers', 'Zombie Hunters', 'Spider Stompers', 'Enderman Enders'
  ];

  const getRandomTeamName = () => {
    const randomName = coolTeamNames[Math.floor(Math.random() * coolTeamNames.length)];
    setFormData(prev => ({ ...prev, teamName: randomName }));
    setShowTeamSuggestions(false);
  };

  useEffect(() => {
    const loadTournament = async () => {
      try {
        // Get tournament data from Firebase
        const tournamentData = await getTournament(resolvedParams.id);
        
        if (tournamentData) {
          // Get current team count
          const teamCount = await getTeamCount(resolvedParams.id);
          setTournament({
            ...tournamentData,
            slots: tournamentData.maxSlots,
            registered: teamCount
          });
        } else {
          router.push('/tournaments');
        }
      } catch (error) {
        console.error('Error loading tournament:', error);
        router.push('/tournaments');
      } finally {
        setLoading(false);
      }
    };

    loadTournament();
  }, [resolvedParams.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Close team suggestions when user starts typing their own team name
    if (field === 'teamName' && value.length > 0) {
      setShowTeamSuggestions(false);
    }
  };

  const handleTeammateDiscordChange = (index: number, value: string) => {
    const newTeammateDiscords = [...formData.teammateDiscords];
    newTeammateDiscords[index] = value;
    setFormData(prev => ({ ...prev, teammateDiscords: newTeammateDiscords }));
  };

  const handleTeammateChange = (index: number, value: string) => {
    const newTeammates = [...formData.teammates];
    newTeammates[index] = value;
    setFormData(prev => ({ ...prev, teammates: newTeammates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Get tournament data from Firebase
      const tournament = await getTournament(resolvedParams.id);

      if (!tournament) {
        setError('Tournament not found');
        return;
      }

      // Prepare team data for Firebase
      const teamData = {
        name: formData.teamName.trim(),
        captain: formData.minecraftIGN.trim(),
        members: [formData.minecraftIGN.trim(), ...formData.teammates.filter(t => t.trim())],
        discord: formData.discord.trim(),
        rewardReceiver: formData.rewardReceiver.trim() || formData.minecraftIGN.trim(),
        tournamentId: resolvedParams.id,
        status: 'registered' as const,
        registeredAt: new Date().toISOString()
      };

      // Register team via Firebase
      const newTeam = await registerTeam(teamData);

      // Send Discord notification
      try {
        const discordResponse = await fetch('/api/discord/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            team: {
              ...teamData,
              discordUsers: [formData.discord.trim(), ...formData.teammateDiscords.filter(d => d.trim())]
            },
            tournament: tournament
          })
        });

        if (!discordResponse.ok) {
          console.error('Discord notification failed:', await discordResponse.text());
        } else {
          console.log('Discord notification sent successfully');
        }
      } catch (discordError) {
        console.error('Error sending Discord notification:', discordError);
      }

      // Check if tournament is now full and generate matches automatically
      try {
        const currentTeams = await getTeamCount(tournament.id);
        if (currentTeams >= tournament.maxSlots) {
          console.log('🎯 Tournament is full, closing registration automatically...');
          
          // Close registration
          await updateTournament(tournament.id, { ...tournament, status: 'closed' });
          
          console.log('✅ Registration closed! Matches must be generated manually by admin.');
        }
      } catch (matchError) {
        console.error('Error in automatic match generation:', matchError);
      }

      // Success - redirect to tournament page
      router.push(`/tournaments/${resolvedParams.id}?registered=true`);

    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          setError('A team with this name is already registered for this tournament');
        } else if (error.message.includes('full')) {
          setError('This tournament is full');
        } else {
          setError(error.message);
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    if (!formData.teamName.trim()) {
      setError('Team name is required');
      return false;
    }
    if (!formData.minecraftIGN.trim()) {
      setError('Captain Minecraft name is required');
      return false;
    }
    if (!formData.discord.trim()) {
      setError('Captain Discord is required');
      return false;
    }
    if (!tournament) {
      setError('Tournament not loaded');
      return false;
    }
    if (tournament.format === 'Duo' && !formData.teammates[0].trim()) {
      setError('Teammate name is required');
      return false;
    }
    if (tournament.format === 'rbw 4v4') {
      const emptyTeammates = formData.teammates.filter(t => !t.trim());
      if (emptyTeammates.length > 0) {
        setError('All teammate names are required');
        return false;
      }
    }
    return true;
  };

  const getTeammateFields = () => {
    if (!tournament) return null;
    if (tournament.format === 'Solo') return null;
    if (tournament.format === 'Duo') {
      return (
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-slate-400 mb-1">Team Name</label>
            <div className="relative">
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => handleInputChange('teamName', e.target.value)}
                onFocus={() => setShowTeamSuggestions(true)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-10"
                placeholder="Enter team name"
                required
              />
              <button
                type="button"
                onClick={() => setShowTeamSuggestions(!showTeamSuggestions)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-400 hover:text-emerald-300 transition-colors"
                title="Get team name suggestion"
              >
                🎲
              </button>
            </div>
            
            {showTeamSuggestions && (
              <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                <div className="p-2">
                  <p className="text-xs text-slate-400 mb-2">💡 Cool BedWars Team Names:</p>
                  <div className="grid grid-cols-2 gap-1">
                    {coolTeamNames.slice(0, 10).map((name, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, teamName: name }));
                          setShowTeamSuggestions(false);
                        }}
                        className="text-left text-xs text-slate-300 hover:bg-slate-700 hover:text-white px-2 py-1 rounded transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={getRandomTeamName}
                    className="w-full mt-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded transition-colors"
                  >
                    🎲 Random Team Name
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Teammate Minecraft IGN</label>
            <input
              type="text"
              value={formData.teammates[0]}
              onChange={(e) => handleTeammateChange(0, e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Enter teammate's IGN"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Teammate Discord Username</label>
            <input
              type="text"
              value={formData.teammateDiscords[0]}
              onChange={(e) => handleTeammateDiscordChange(0, e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="teammate#1234"
              required
            />
          </div>
        </div>
      );
    }
    if (tournament.format === 'rbw 4v4') {
      return (
        <>
          <div className="relative">
            <label className="block text-sm font-medium text-slate-400 mb-1">Team Name</label>
            <div className="relative">
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => handleInputChange('teamName', e.target.value)}
                onFocus={() => setShowTeamSuggestions(true)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-10"
                placeholder="Enter team name"
                required
              />
              <button
                type="button"
                onClick={() => setShowTeamSuggestions(!showTeamSuggestions)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-400 hover:text-emerald-300 transition-colors"
                title="Get team name suggestion"
              >
                🎲
              </button>
            </div>
            
            {showTeamSuggestions && (
              <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                <div className="p-2">
                  <p className="text-xs text-slate-400 mb-2">💡 Cool BedWars Team Names:</p>
                  <div className="grid grid-cols-2 gap-1">
                    {coolTeamNames.slice(0, 10).map((name, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, teamName: name }));
                          setShowTeamSuggestions(false);
                        }}
                        className="text-left text-xs text-slate-300 hover:bg-slate-700 hover:text-white px-2 py-1 rounded transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={getRandomTeamName}
                    className="w-full mt-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded transition-colors"
                  >
                    🎲 Random Team Name
                  </button>
                </div>
              </div>
            )}
          </div>
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Teammate {index + 1} Minecraft IGN
                </label>
                <input
                  type="text"
                  value={formData.teammates[index]}
                  onChange={(e) => handleTeammateChange(index, e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder={`Enter teammate ${index + 1}'s IGN`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Teammate {index + 1} Discord Username
                </label>
                <input
                  type="text"
                  value={formData.teammateDiscords[index]}
                  onChange={(e) => handleTeammateDiscordChange(index, e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder={`teammate${index + 1}#1234`}
                  required
                />
              </div>
            </div>
          ))}
        </>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">Loading tournament...</div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if tournament is full
  if (tournament && tournament.registered >= tournament.slots) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <span className="text-6xl mb-6 block">🔒</span>
            <h1 className="text-3xl font-bold text-white mb-4">Registration Closed</h1>
            <p className="text-slate-400 mb-6">
              This tournament has reached its maximum capacity of {tournament.slots} teams.
            </p>
            <p className="text-slate-400 mb-8">
              Registered: {tournament.registered}/{tournament.slots} teams
            </p>
            <Link 
              href={`/tournaments/${resolvedParams.id}`}
              className="btn-gradient px-6 py-3 rounded-lg font-medium inline-block"
            >
              Back to Tournament
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  
  // Remove the tournament check since we always have default data
  // The form should always be visible with fallback data

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 mobile-optimized">
        <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 safe-area-padding">
          
          {/* Header */}
          <section className="mb-8">
            <Link 
              href={`/tournaments/${resolvedParams.id}`}
              className="text-emerald-400 hover:text-emerald-300 transition-colors mb-4 inline-block"
            >
              ← Back to Tournament
            </Link>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Register for Tournament</h1>
            <p className="mt-2 text-slate-400">Complete form below to join {tournament?.name || 'Tournament'}</p>
          </section>

          {/* Tournament Info */}
          <section className="card-glass p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Tournament Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-slate-400">Tournament</span>
                <p className="text-white font-medium">{tournament?.name || 'Loading...'}</p>
              </div>
              <div>
                <span className="text-sm text-slate-400">Format</span>
                <p className="text-white font-medium">{tournament?.format || 'Loading...'}</p>
              </div>
              <div>
                <span className="text-sm text-slate-400">Date & Time</span>
                <p className="text-white font-medium">{tournament?.date || 'Loading...'} at {tournament?.time || 'Loading...'}</p>
              </div>
              <div>
                <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Prize Pool</span>
                <div className="mt-2 space-y-1">
                  {tournament?.prizePool ? tournament.prizePool.split('\n').map((prize: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-amber-400 text-xs mt-0.5">🏆</span>
                      <span className="text-emerald-400 font-medium text-sm">{prize.trim()}</span>
                    </div>
                  )) : (
                    <div className="text-slate-400 text-sm">No prize information</div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Registration Form */}
          <section className="card-glass p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Registration Form</h2>
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-red-400">⚠️</span>
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Caption Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Display Name *</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="Enter your display name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Minecraft IGN *</label>
                    <input
                      type="text"
                      value={formData.minecraftIGN}
                      onChange={(e) => handleInputChange('minecraftIGN', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="Enter your Minecraft IGN"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Discord *</label>
                    <input
                      type="text"
                      value={formData.discord}
                      onChange={(e) => handleInputChange('discord', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="username#1234"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Team Information */}
              {tournament?.format && tournament.format !== 'Solo' && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Team Information</h3>
                  <div className="space-y-4">
                    {getTeammateFields()}
                  </div>
                </div>
              )}

              {/* Reward Receiver Selection */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Reward Information</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Reward Receiver *</label>
                  <select
                    value={formData.rewardReceiver}
                    onChange={(e) => handleInputChange('rewardReceiver', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  >
                    <option value="captain" className="text-gray-900">Captain ({formData.minecraftIGN || 'Your IGN'})</option>
                    {formData.teammates.filter(t => t.trim() !== '').map((teammate, index) => (
                      <option key={index} value={teammate} className="text-gray-900">
                        Teammate ({teammate})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Who should receive the tournament rewards?</p>
                </div>
              </div>

              {/* Rules Agreement */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Tournament Rules</h3>
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <ul className="space-y-2 text-sm text-slate-300">
                    {tournament?.rules?.map((rule: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        {rule}
                      </li>
                    )) || <li className="text-slate-400">Loading rules...</li>}
                  </ul>
                </div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-emerald-500 bg-white/10 border-white/20 rounded focus:ring-emerald-400 focus:ring-2"
                    required
                  />
                  <span className="text-sm text-slate-300">
                    I agree to follow all tournament rules and understand that violation may result in disqualification.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Link
                  href={`/tournaments/${resolvedParams.id}`}
                  className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gradient px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Registering...' : 'Register for Tournament'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
