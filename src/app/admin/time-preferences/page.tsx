'use client';

import { useState, useEffect } from 'react';
import { getTeams, updateTeam } from '@/lib/firebase-database';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface TimePreference {
  teamId: string;
  teamName: string;
  preferredDays: string[];
  preferredTimes: string[];
  timezone: string;
  notes?: string;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const TIME_SLOTS = [
  '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
];

const TIMEZONES = [
  'UTC', 'EST', 'PST', 'CST', 'MST', 'GMT', 'CET', 'IST', 'JST', 'AEST'
];

export default function TimePreferencesPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<TimePreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTeamsAndPreferences();
  }, []);

  const loadTeamsAndPreferences = async () => {
    try {
      const teamsData = await getTeams('pYKa4M27SfgwxGoAYPRs');
      const qualifiedTeams = teamsData.filter(team => team.status !== 'disqualified');
      
      setTeams(qualifiedTeams);
      
      // Initialize preferences for all teams
      const initialPreferences: TimePreference[] = qualifiedTeams.map(team => ({
        teamId: team.id || '',
        teamName: team.name,
        preferredDays: team.timePreferences?.preferredDays || [],
        preferredTimes: team.timePreferences?.preferredTimes || [],
        timezone: team.timePreferences?.timezone || 'UTC',
        notes: team.timePreferences?.notes || ''
      }));
      
      setPreferences(initialPreferences);
      setLoading(false);
    } catch (error) {
      console.error('Error loading teams:', error);
      setMessage('❌ Failed to load teams');
      setLoading(false);
    }
  };

  const handleDayToggle = (teamId: string, day: string) => {
    setPreferences(prev => prev.map(pref => {
      if (pref.teamId === teamId) {
        const newDays = pref.preferredDays.includes(day)
          ? pref.preferredDays.filter(d => d !== day)
          : [...pref.preferredDays, day];
        return { ...pref, preferredDays: newDays };
      }
      return pref;
    }));
  };

  const handleTimeToggle = (teamId: string, time: string) => {
    setPreferences(prev => prev.map(pref => {
      if (pref.teamId === teamId) {
        const newTimes = pref.preferredTimes.includes(time)
          ? pref.preferredTimes.filter(t => t !== time)
          : [...pref.preferredTimes, time];
        return { ...pref, preferredTimes: newTimes };
      }
      return pref;
    }));
  };

  const handleTimezoneChange = (teamId: string, timezone: string) => {
    setPreferences(prev => prev.map(pref => 
      pref.teamId === teamId ? { ...pref, timezone } : pref
    ));
  };

  const handleNotesChange = (teamId: string, notes: string) => {
    setPreferences(prev => prev.map(pref => 
      pref.teamId === teamId ? { ...pref, notes } : pref
    ));
  };

  const savePreferences = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      // Update each team with their preferences
      for (const pref of preferences) {
        await updateTeam(pref.teamId, {
          timePreferences: {
            preferredDays: pref.preferredDays,
            preferredTimes: pref.preferredTimes,
            timezone: pref.timezone,
            notes: pref.notes
          }
        });
      }
      
      setMessage('✅ Time preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('❌ Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const getTeamPreference = (teamId: string) => {
    return preferences.find(pref => pref.teamId === teamId);
  };

  const getPreferenceSummary = (pref: TimePreference) => {
    const dayCount = pref.preferredDays.length;
    const timeCount = pref.preferredTimes.length;
    
    if (dayCount === 0 && timeCount === 0) {
      return <span className="text-red-400">No preferences set</span>;
    }
    
    const parts = [];
    if (dayCount > 0) parts.push(`${dayCount} day${dayCount > 1 ? 's' : ''}`);
    if (timeCount > 0) parts.push(`${timeCount} time${timeCount > 1 ? 's' : ''}`);
    
    return <span className="text-green-400">{parts.join(', ')}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
            <p className="mt-4">Loading teams...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⏰ Team Time Preferences</h1>
          <p className="text-slate-300">Manage preferred match times and days for all teams</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('✅') 
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
              : 'bg-red-500/20 border-red-500 text-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">Total Teams</h3>
            <p className="text-3xl font-bold text-white">{teams.length}</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Teams with Preferences</h3>
            <p className="text-3xl font-bold text-white">
              {preferences.filter(pref => pref.preferredDays.length > 0 || pref.preferredTimes.length > 0).length}
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">Teams Without Preferences</h3>
            <p className="text-3xl font-bold text-white">
              {preferences.filter(pref => pref.preferredDays.length === 0 && pref.preferredTimes.length === 0).length}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={savePreferences}
            disabled={saving}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
          >
            {saving ? '💾 Saving...' : '💾 Save All Preferences'}
          </button>
          
          <button
            onClick={loadTeamsAndPreferences}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            🔄 Reload
          </button>
        </div>

        {/* Teams List */}
        <div className="space-y-4">
          {teams.map(team => {
            const pref = getTeamPreference(team.id);
            const isSelected = selectedTeam === team.id;
            
            return (
              <div key={team.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                {/* Team Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  onClick={() => setSelectedTeam(isSelected ? null : team.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{team.name}</h3>
                      <p className="text-slate-400">Captain: {team.captain}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Preferences:</p>
                        {getPreferenceSummary(pref!)}
                      </div>
                      <div className={`transform transition-transform ${isSelected ? 'rotate-180' : ''}`}>
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Preferences */}
                {isSelected && pref && (
                  <div className="border-t border-slate-700 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Days Selection */}
                      <div>
                        <h4 className="text-lg font-medium text-white mb-4">📅 Preferred Days</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {DAYS_OF_WEEK.map(day => (
                            <label key={day} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pref.preferredDays.includes(day)}
                                onChange={() => handleDayToggle(team.id, day)}
                                className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-slate-300">{day}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Times Selection */}
                      <div>
                        <h4 className="text-lg font-medium text-white mb-4">🕐 Preferred Times</h4>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {TIME_SLOTS.map(time => (
                            <label key={time} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pref.preferredTimes.includes(time)}
                                onChange={() => handleTimeToggle(team.id, time)}
                                className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-slate-300">{time}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Timezone */}
                      <div>
                        <h4 className="text-lg font-medium text-white mb-4">🌍 Timezone</h4>
                        <select
                          value={pref.timezone}
                          onChange={(e) => handleTimezoneChange(team.id, e.target.value)}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {TIMEZONES.map(tz => (
                            <option key={tz} value={tz}>{tz}</option>
                          ))}
                        </select>
                      </div>

                      {/* Notes */}
                      <div>
                        <h4 className="text-lg font-medium text-white mb-4">📝 Notes</h4>
                        <textarea
                          value={pref.notes || ''}
                          onChange={(e) => handleNotesChange(team.id, e.target.value)}
                          placeholder="Any additional scheduling notes or constraints..."
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
