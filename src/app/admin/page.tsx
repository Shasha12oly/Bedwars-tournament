'use client';

import { useState, useEffect } from 'react';
// No database imports - use API calls instead
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TeamInfoPopup from '@/components/TeamInfoPopup';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Match {
  id: string;
  round: string;
  player1: string;
  player2: string;
  status: 'upcoming' | 'live' | 'completed';
  result?: string;
  scheduledTime: string;
}

interface Team {
  id: string;
  tournamentId: string;
  name: string;
  captain: string;
  members: string[];
  discordUsers: string[];
  rewardReceiver: string;
  registeredAt: string;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const [tournaments, setTournaments] = useState([]);
  const [tournamentStatus, setTournamentStatus] = useState<'open' | 'closed'>('open');
  const [message, setMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isFillingSampleData, setIsFillingSampleData] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [winner, setWinner] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string } | null>(null);

  // Generate random team names
  const generateRandomTeamNames = () => {
    const adjectives = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Sigma', 'Tau', 'Phi', 'Psi', 'Chi', 'Theta', 'Lambda', 'Mu', 'Nu', 'Xi', 'Rho'];
    const nouns = ['Warriors', 'Titans', 'Legends', 'Champions', 'Masters', 'Guardians', 'Phantoms', 'Vipers', 'Eagles', 'Lions', 'Tigers', 'Dragons', 'Phoenix', 'Raptors', 'Sharks', 'Wolves'];
    const teamNames = [];
    for (let i = 0; i < 16; i++) {
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      teamNames.push(`${adjective} ${noun}`);
    }
    return teamNames;
  };

  // Fill tournament with sample data
  const fillSampleData = async () => {
    if (teamCount >= 16) {
      setMessage('⚠️ Tournament is already full (16/16 teams). Reset first if you want to fill with new sample data.');
      return;
    }

    setIsFillingSampleData(true);
    
    try {
      const response = await fetch('/api/admin/fill-sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ ' + result.message);
        // Reload data
        loadData();
      } else {
        setMessage('❌ ' + (result.error || 'Failed to fill sample data'));
      }
      
    } catch (error) {
      setMessage('❌ Error filling sample data. Please try again.');
      console.error('Sample data error:', error);
    } finally {
      setIsFillingSampleData(false);
    }
  };

  // Reset tournament
  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all registrations and matches? This action cannot be undone!')) {
      return;
    }

    setIsResetting(true);
    setMessage('');

    try {
      // Reset teams
      const teamsResponse = await fetch('/api/teams', {
        method: 'DELETE',
      });

      // Reset matches by deleting all matches
      const matchesResponse = await fetch('/api/matches', {
        method: 'DELETE',
      });

      const teamsResult = teamsResponse.ok ? await teamsResponse.json() : null;

      if (teamsResponse.ok && matchesResponse.ok) {
        setMessage('✅ All registrations and matches have been reset successfully!');
        await loadData(); // Reload the data
      } else {
        setMessage('❌ ' + (teamsResult.error || 'Failed to reset registrations and matches'));
      }
    } catch (error) {
      setMessage('❌ Error resetting registrations and matches. Please try again.');
      console.error('Reset error:', error);
    } finally {
      setIsResetting(false);
    }
  };

  // Load data
  const loadData = async () => {
    try {
      const [teamsResponse, matchesResponse] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/matches')
      ]);
      
      const teamsData = await teamsResponse.json();
      const matchesData = await matchesResponse.json();
      
      // Ensure data is arrays
      const safeTeams = Array.isArray(teamsData) ? teamsData : [];
      const safeMatches = Array.isArray(matchesData) ? matchesData : [];
      
      setTeams(safeTeams);
      setMatches(safeMatches);
      setTeamCount(safeTeams.length);
      const newStatus = safeTeams.length >= 16 ? 'closed' : 'open';
      setTournamentStatus(newStatus);
      
      // Update tournament status in database only if there are teams or status actually changed
      if (tournaments.length > 0 && tournaments[0].status !== newStatus && (safeTeams.length > 0 || newStatus === 'open')) {
        fetch('/api/tournaments/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            tournamentId: tournaments[0].id, 
            status: newStatus 
          })
        }).catch(console.error);
      }
      
      // If no matches exist, add sample matches for display
      if (safeMatches.length === 0) {
        const sampleMatches: Match[] = [
          // Round of 16 - 8 matches
          { id: 'r16-1', round: 'Round of 16', player1: 'Team 1', player2: 'Team 2', status: 'upcoming', scheduledTime: '2:00 PM' },
          { id: 'r16-2', round: 'Round of 16', player1: 'Team 3', player2: 'Team 4', status: 'upcoming', scheduledTime: '2:15 PM' },
          { id: 'r16-3', round: 'Round of 16', player1: 'Team 5', player2: 'Team 6', status: 'upcoming', scheduledTime: '2:30 PM' },
          { id: 'r16-4', round: 'Round of 16', player1: 'Team 7', player2: 'Team 8', status: 'upcoming', scheduledTime: '2:45 PM' },
          { id: 'r16-5', round: 'Round of 16', player1: 'Team 9', player2: 'Team 10', status: 'upcoming', scheduledTime: '3:00 PM' },
          { id: 'r16-6', round: 'Round of 16', player1: 'Team 11', player2: 'Team 12', status: 'upcoming', scheduledTime: '3:15 PM' },
          { id: 'r16-7', round: 'Round of 16', player1: 'Team 13', player2: 'Team 14', status: 'upcoming', scheduledTime: '3:30 PM' },
          { id: 'r16-8', round: 'Round of 16', player1: 'Team 15', player2: 'Team 16', status: 'upcoming', scheduledTime: '3:45 PM' },
          // Quarterfinals - 4 matches
          { id: 'qf-1', round: 'Quarterfinals', player1: 'Winner of Match 1', player2: 'Winner of Match 2', status: 'upcoming', scheduledTime: '4:15 PM' },
          { id: 'qf-2', round: 'Quarterfinals', player1: 'Winner of Match 3', player2: 'Winner of Match 4', status: 'upcoming', scheduledTime: '4:30 PM' },
          { id: 'qf-3', round: 'Quarterfinals', player1: 'Winner of Match 5', player2: 'Winner of Match 6', status: 'upcoming', scheduledTime: '4:45 PM' },
          { id: 'qf-4', round: 'Quarterfinals', player1: 'Winner of Match 7', player2: 'Winner of Match 8', status: 'upcoming', scheduledTime: '5:00 PM' },
          // Semifinals - 2 matches
          { id: 'sf-1', round: 'Semifinals', player1: 'Winner of QF 1', player2: 'Winner of QF 2', status: 'upcoming', scheduledTime: '6:30 PM' },
          { id: 'sf-2', round: 'Semifinals', player1: 'Winner of QF 3', player2: 'Winner of QF 4', status: 'upcoming', scheduledTime: '7:00 PM' },
          // Final - 1 match
          { id: 'final', round: 'Final', player1: 'Winner of SF 1', player2: 'Winner of SF 2', status: 'upcoming', scheduledTime: '8:30 PM' }
        ];
        setMatches(sampleMatches);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set sample data on error
      setTeams([]);
      const sampleMatches: Match[] = [
        // Round of 16 - 8 matches
        { id: 'r16-1', round: 'Round of 16', player1: 'Team 1', player2: 'Team 2', status: 'upcoming', scheduledTime: '2:00 PM' },
        { id: 'r16-2', round: 'Round of 16', player1: 'Team 3', player2: 'Team 4', status: 'upcoming', scheduledTime: '2:15 PM' },
        { id: 'r16-3', round: 'Round of 16', player1: 'Team 5', player2: 'Team 6', status: 'upcoming', scheduledTime: '2:30 PM' },
        { id: 'r16-4', round: 'Round of 16', player1: 'Team 7', player2: 'Team 8', status: 'upcoming', scheduledTime: '2:45 PM' },
        { id: 'r16-5', round: 'Round of 16', player1: 'Team 9', player2: 'Team 10', status: 'upcoming', scheduledTime: '3:00 PM' },
        { id: 'r16-6', round: 'Round of 16', player1: 'Team 11', player2: 'Team 12', status: 'upcoming', scheduledTime: '3:15 PM' },
        { id: 'r16-7', round: 'Round of 16', player1: 'Team 13', player2: 'Team 14', status: 'upcoming', scheduledTime: '3:30 PM' },
        { id: 'r16-8', round: 'Round of 16', player1: 'Team 15', player2: 'Team 16', status: 'upcoming', scheduledTime: '3:45 PM' },
        // Quarterfinals - 4 matches
        { id: 'qf-1', round: 'Quarterfinals', player1: 'Winner of Match 1', player2: 'Winner of Match 2', status: 'upcoming', scheduledTime: '4:15 PM' },
        { id: 'qf-2', round: 'Quarterfinals', player1: 'Winner of Match 3', player2: 'Winner of Match 4', status: 'upcoming', scheduledTime: '4:30 PM' },
        { id: 'qf-3', round: 'Quarterfinals', player1: 'Winner of Match 5', player2: 'Winner of Match 6', status: 'upcoming', scheduledTime: '4:45 PM' },
        { id: 'qf-4', round: 'Quarterfinals', player1: 'Winner of Match 7', player2: 'Winner of Match 8', status: 'upcoming', scheduledTime: '5:00 PM' },
        // Semifinals - 2 matches
        { id: 'sf-1', round: 'Semifinals', player1: 'Winner of QF 1', player2: 'Winner of QF 2', status: 'upcoming', scheduledTime: '6:30 PM' },
        { id: 'sf-2', round: 'Semifinals', player1: 'Winner of QF 3', player2: 'Winner of QF 4', status: 'upcoming', scheduledTime: '7:00 PM' },
        // Final - 1 match
        { id: 'final', round: 'Final', player1: 'Winner of SF 1', player2: 'Winner of SF 2', status: 'upcoming', scheduledTime: '8:30 PM' }
      ];
      setMatches(sampleMatches);
      setTeamCount(0);
      setTournamentStatus('open');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateMatchWinner = async (matchId: string, winnerId: string) => {
    try {
      const response = await fetch('/api/matches/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId, winnerId }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ Match result updated successfully!');
        // Reload matches
        const matchesResponse = await fetch('/api/matches');
        const matchesData = await matchesResponse.json();
        setMatches(Array.isArray(matchesData) ? matchesData : []);
        
        // Dispatch custom event to update matches page
        window.dispatchEvent(new CustomEvent('matchUpdate', { detail: { matchId, winnerId } }));
      } else {
        setMessage('❌ ' + (result.error || 'Failed to update match result'));
      }
    } catch (error) {
      setMessage('❌ Error updating match result.');
      console.error('Match update error:', error);
    }
  };

  
  // Complete a match with winner selection
  const completeMatch = async () => {
    if (!selectedMatch || !winner) return;

    try {
      const response = await fetch('/api/matches/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          matchId: selectedMatch.id, 
          winnerName: winner,
          status: 'completed'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ Match completed successfully!');
        // Reload matches
        const matchesResponse = await fetch('/api/matches');
        const matchesData = await matchesResponse.json();
        setMatches(Array.isArray(matchesData) ? matchesData : []);
        
        // Dispatch custom event to update matches page
        window.dispatchEvent(new CustomEvent('matchUpdate', { 
          detail: { 
            matchId: selectedMatch.id, 
            winnerName: winner,
            status: 'completed'
          } 
        }));
        
        // Close modal
        setSelectedMatch(null);
        setWinner('');
        setIsUpdating(false);
      } else {
        setMessage('❌ ' + (result.error || 'Failed to complete match'));
      }
    } catch (error) {
      // Fallback to local state update
      console.log('Database failed, using local state update');
      const updatedMatches = matches.map(match => {
        if (match.id === selectedMatch.id) {
          return { 
            ...match, 
            status: 'completed' as const, 
            result: `${winner} won` 
          };
        }
        return match;
      });

      setMatches(updatedMatches);
      
      // Update next round matches with winners
      updateNextRoundMatches(selectedMatch, winner, updatedMatches);
      
      // Dispatch custom event to update matches page
      window.dispatchEvent(new CustomEvent('matchUpdate', { 
        detail: { 
          matchId: selectedMatch.id, 
          winnerName: winner,
          status: 'completed'
        } 
      }));
      
      // Close modal
      setSelectedMatch(null);
      setWinner('');
      setIsUpdating(false);
      
      setMessage('✅ Match completed successfully!');
    }
  };

  // Update next round matches with winners (old style)
  const updateNextRoundMatches = (completedMatch: Match, winner: string, currentMatches: Match[]) => {
    const roundOrder = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];
    const currentRoundIndex = roundOrder.indexOf(completedMatch.round);
    const nextRound = roundOrder[currentRoundIndex + 1];
    
    if (!nextRound) return;

    // Find the current match index in its round to determine which next round slot to fill
    const currentRoundMatches = currentMatches.filter(m => m.round === completedMatch.round);
    const currentMatchIndex = currentRoundMatches.findIndex(m => m.id === completedMatch.id);
    
    // Calculate which slot in next round this winner should fill
    const nextRoundSlotIndex = Math.floor(currentMatchIndex / 2);

    const updatedMatches = currentMatches.map(match => {
      if (match.round === nextRound) {
        const nextRoundMatches = currentMatches.filter(m => m.round === nextRound);
        const targetMatch = nextRoundMatches[nextRoundSlotIndex];
        
        if (match.id === targetMatch?.id) {
          // Fill the first available slot (player1 or player2)
          if (match.player1 === 'TBD') {
            return { ...match, player1: winner };
          } else if (match.player2 === 'TBD') {
            return { ...match, player2: winner };
          }
        }
      }
      return match;
    });

    setMatches(updatedMatches);
    
    // Dispatch custom event to update matches page with next round changes
    window.dispatchEvent(new CustomEvent('matchUpdate'));
  };

  // Get status color for UI
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500/20 text-red-400';
      case 'upcoming': return 'bg-amber-500/20 text-amber-400';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  // Get status display name
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'live': return 'LIVE';
      case 'upcoming': return 'UPCOMING';
      case 'completed': return 'COMPLETED';
      default: return status;
    }
  };

  // Handle team click
  const handleTeamClick = (teamId: string, teamName: string) => {
    if (teamId && teamId !== 'TBD' && !teamName.includes('Winner of') && !teamName.match(/^Team \d+$/)) {
      setSelectedTeam({ id: teamId, name: teamName });
    }
  };

  // Get display name for team
  const getTeamDisplayName = (teamName: string, teamId?: string) => {
    // If it's a winner slot, show as is
    if (teamName.includes('Winner of')) {
      return teamName;
    }
    
    // If it's a generic placeholder (Team 1, Team 2, etc.), show as Team A/Team B
    if (teamName.match(/^Team \d+$/)) {
      return teamName.includes('Team 1') ? 'Team A' : teamName.includes('Team 2') ? 'Team B' : teamName;
    }
    
    // For real team names, show them as they are
    return teamName;
  };

  // Start a match (using API with fallback to local state)
  const startMatch = async (matchId: string) => {
    try {
      const response = await fetch('/api/matches/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId, status: 'live' }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ Match started successfully!');
        // Reload matches
        const matchesResponse = await fetch('/api/matches');
        const matchesData = await matchesResponse.json();
        setMatches(Array.isArray(matchesData) ? matchesData : []);
        
        // Dispatch custom event to update matches page
        window.dispatchEvent(new CustomEvent('matchUpdate', { detail: { matchId, status: 'live' } }));
      } else {
        setMessage('❌ ' + (result.error || 'Failed to start match'));
      }
    } catch (error) {
      // Fallback to local state update
      console.log('Database failed, using local state update');
      const updatedMatches = matches.map(match =>
        match.id === matchId ? { ...match, status: 'live' as const } : match
      );
      setMatches(updatedMatches);
      setMessage('✅ Match started successfully!');
      
      // Dispatch custom event to update matches page
      window.dispatchEvent(new CustomEvent('matchUpdate', { detail: { matchId, status: 'live' } }));
    }
  };

  const generateBracket = async () => {
    setMessage('');
    
    try {
      const response = await fetch('/api/matches/generate-bracket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tournamentId: '1' }) // Assuming tournament ID 1
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        // Reload matches
        const matchesResponse = await fetch('/api/matches');
        const matchesData = await matchesResponse.json();
        setMatches(matchesData);
        // Reload tournament status
        const tournamentsResponse = await fetch('/api/tournaments');
        const tournamentsData = await tournamentsResponse.json();
        if (tournamentsData.length > 0) {
          setTournamentStatus(tournamentsData[0].status);
        }
      } else {
        setMessage('❌ ' + (result.error || 'Failed to generate bracket'));
      }
      
    } catch (error) {
      setMessage('❌ Error generating tournament bracket.');
      console.error('Bracket generation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage tournaments, teams, and matches</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 
            message.includes('⚠️') ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' :
            'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-800 p-1 rounded-lg">
          {['overview', 'teams', 'matches', 'actions', 'database'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Teams Registered</h3>
              <p className="text-3xl font-bold text-blue-400">{teamCount}/16</p>
              <p className="text-slate-400 mt-2">Registration {tournamentStatus === 'open' ? 'Open' : 'Closed'}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Total Matches</h3>
              <p className="text-3xl font-bold text-green-400">{matches.length}</p>
              <p className="text-slate-400 mt-2">Tournament brackets</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Tournament Status</h3>
              <p className="text-3xl font-bold text-purple-400 capitalize">{tournamentStatus}</p>
              <p className="text-slate-400 mt-2">Current state</p>
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Registered Teams</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="pb-3 text-slate-400">Team Name</th>
                    <th className="pb-3 text-slate-400">Captain</th>
                    <th className="pb-3 text-slate-400">Members</th>
                    <th className="pb-3 text-slate-400">Discord</th>
                  </tr>
                </thead>
                <tbody>
                  {(teams || []).map((team) => (
                    <tr key={team.id} className="border-b border-slate-700">
                      <td className="py-3 text-white font-medium">{team.name}</td>
                      <td className="py-3 text-slate-300">{team.captain}</td>
                      <td className="py-3 text-slate-300">{(team.members || []).join(', ')}</td>
                      <td className="py-3 text-slate-300">{team.discordUsers?.[0] || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!teams || teams.length === 0) && (
                <p className="text-center text-slate-400 py-8">No teams registered yet</p>
              )}
            </div>
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Match Management</h2>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/matches', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        action: 'generate-bracket',
                        tournamentId: '1',
                        tournamentName: tournaments?.[0]?.name || 'Blood Rush BedWars'
                      }),
                    });
                    
                    if (response.ok) {
                      // Refresh matches data
                      const matchesResponse = await fetch('/api/matches?tournamentId=1');
                      const matchesData = await matchesResponse.json();
                      setMatches(matchesData);
                      console.log('✅ Bracket regenerated with real team names');
                    }
                  } catch (error) {
                    console.error('❌ Error regenerating bracket:', error);
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                🔄 Regenerate Bracket
              </button>
            </div>
            
            <div className="space-y-6">
              {['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'].map((round) => {
                const roundMatches = Array.isArray(matches) ? matches.filter(match => match.round === round) : [];
                if (roundMatches.length === 0) return null;
                
                return (
                  <div key={round} className="border border-white/10 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">{round}</h3>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      {roundMatches.map((match) => (
                        <div key={match.id} className="bg-white/5 rounded p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                              {getStatusDisplay(match.status)}
                            </span>
                            <span className="text-xs text-slate-400">{match.scheduledTime}</span>
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <div className={`text-center font-medium ${
                              match.result === match.player1 ? 'text-emerald-400' : 'text-white'
                            } ${
                              match.player1Id && match.player1Id !== 'TBD' && !match.player1.includes('Winner of') && !match.player1.match(/^Team \d+$/)
                                ? 'cursor-pointer hover:text-emerald-300 transition-colors' 
                                : ''
                            }`}
                            onClick={() => handleTeamClick(match.player1Id || '', match.player1)}
                          >
                            {getTeamDisplayName(match.player1, match.player1Id)}
                            {match.result === match.player1 && <span className="ml-1">👑</span>}
                          </div>
                            <div className="text-center text-slate-400 text-xs">VS</div>
                            <div className={`text-center font-medium ${
                              match.result === match.player2 ? 'text-emerald-400' : 'text-white'
                            } ${
                              match.player2Id && match.player2Id !== 'TBD' && !match.player2.includes('Winner of') && !match.player2.match(/^Team \d+$/)
                                ? 'cursor-pointer hover:text-emerald-300 transition-colors' 
                                : ''
                            }`}
                            onClick={() => handleTeamClick(match.player2Id || '', match.player2)}
                          >
                            {getTeamDisplayName(match.player2, match.player2Id)}
                            {match.result === match.player2 && <span className="ml-1">👑</span>}
                          </div>
                          </div>
                          
                          {match.result && (
                            <div className="mt-2 text-center text-xs text-emerald-400">
                              {match.result}
                            </div>
                          )}
                          
                          <div className="mt-3 flex gap-2">
                            {match.status === 'upcoming' && (
                              <>
                                <button
                                  onClick={() => startMatch(match.id)}
                                  className="flex-1 bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-500/30 transition"
                                >
                                  Start
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedMatch(match);
                                    setIsUpdating(true);
                                  }}
                                  className="flex-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs hover:bg-emerald-500/30 transition"
                                >
                                  Complete
                                </button>
                              </>
                            )}
                            {match.status === 'live' && (
                              <button
                                onClick={() => {
                                  setSelectedMatch(match);
                                  setIsUpdating(true);
                                }}
                                className="flex-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs hover:bg-emerald-500/30 transition"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {(!Array.isArray(matches) || matches.length === 0) && (
                <div className="bg-slate-800 rounded-lg p-6">
                  <p className="text-center text-slate-400 py-8">No matches created yet. Generate bracket first!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            {/* Fill Sample Data */}
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">🎮 Fill Sample Data</h3>
              <p className="text-slate-300 mb-4">
                Generate 16 random teams and create tournament brackets for testing.
              </p>
              <button
                onClick={fillSampleData}
                disabled={isFillingSampleData || teamCount >= 16}
                className="btn-gradient px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFillingSampleData ? 'Generating...' : '🎲 Generate Sample Teams'}
              </button>
            </div>

            {/* Reset Tournament */}
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-red-400 mb-4">⚠️ Reset Tournament</h3>
              <p className="text-slate-300 mb-4">
                This will permanently delete all registered teams and matches and reopen registration.
                This action cannot be undone!
              </p>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-white">Current teams: <span className="font-medium">{teamCount}/16</span></span>
              </div>
              <button
                onClick={handleReset}
                disabled={isResetting || teamCount === 0}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? 'Resetting...' : '🗑️ Reset All'}
              </button>
            </div>
          </div>
        )}

        {/* Winner Selection Modal */}
        {isUpdating && selectedMatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card-glass p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-white mb-4">Select Winner</h3>
              <p className="text-slate-400 mb-4">
                {selectedMatch.player1} vs {selectedMatch.player2}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setWinner(selectedMatch.player1)}
                  className={`w-full p-3 rounded border transition ${
                    winner === selectedMatch.player1
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {selectedMatch.player1} {selectedMatch.result === selectedMatch.player1 && '👑'}
                </button>
                <button
                  onClick={() => setWinner(selectedMatch.player2)}
                  className={`w-full p-3 rounded border transition ${
                    winner === selectedMatch.player2
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {selectedMatch.player2} {selectedMatch.result === selectedMatch.player2 && '👑'}
                </button>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsUpdating(false);
                    setSelectedMatch(null);
                    setWinner('');
                  }}
                  className="flex-1 bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={completeMatch}
                  disabled={!winner}
                  className="flex-1 btn-gradient px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Winner
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Database Status Tab */}
        {activeTab === 'database' && (
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Database Status</h2>
              <Link 
                href="/admin/database-status"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                View Detailed Status
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Teams Database */}
              <div className="bg-slate-900 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Teams</h3>
                  <span className="text-2xl">👥</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Count:</span>
                    <span className="text-white font-medium">{teamCount}</span>
                  </div>
                </div>
              </div>

              {/* Tournaments Database */}
              <div className="bg-slate-900 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Tournaments</h3>
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Count:</span>
                    <span className="text-white font-medium">{Array.isArray(tournaments) ? tournaments.length : 0}</span>
                  </div>
                </div>
              </div>

              {/* Matches Database */}
              <div className="bg-slate-900 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Matches</h3>
                  <span className="text-2xl">⚔️</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Storage:</span>
                    <span className="text-emerald-400">JSON File</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Count:</span>
                    <span className="text-white font-medium">{matches.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-slate-900 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Database Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-emerald-400 mb-2">Storage Architecture</h4>
                  <div className="space-y-1 text-slate-300 text-sm">
                    <p><strong>Teams:</strong> PostgreSQL Database</p>
                    <p><strong>Tournaments:</strong> PostgreSQL Database</p>
                    <p><strong>Matches:</strong> JSON File Storage</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-emerald-400 mb-2">System Status</h4>
                  <div className="space-y-1 text-slate-300 text-sm">
                    <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
                    <p><strong>JSON Storage:</strong> /data/matches.json</p>
                    <p><strong>Auto-backup:</strong> Enabled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Info Popup */}
        {selectedTeam && (
          <TeamInfoPopup
            teamId={selectedTeam.id}
            teamName={selectedTeam.name}
            onClose={() => setSelectedTeam(null)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
