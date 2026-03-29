'use client';

import { useState, useEffect } from 'react';
import { getTeams, getMatches, updateMatches, updateSingleMatch, resetTournamentTeams, resetTournamentMatches, registerTeam, getTournament, updateTournament } from '@/lib/firebase-database';
import { generateTournamentMatches } from '@/lib/match-making';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BracketEditor from '@/components/BracketEditor';

interface Match {
  id: string;
  tournamentId: string;
  round: string;
  player1: string;
  player2: string;
  status: 'upcoming' | 'live' | 'completed';
  result: string | null;
  scheduledTime: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [teamCount, setTeamCount] = useState(0);
  const [tournamentStatus, setTournamentStatus] = useState<'open' | 'closed' | 'matches_generated' | 'completed'>('open');
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFillingSampleData, setIsFillingSampleData] = useState(false);
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [winner, setWinner] = useState('');
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [isResendingDiscord, setIsResendingDiscord] = useState(false);
  const [editingTeamDiscord, setEditingTeamDiscord] = useState<string | null>(null);
  const [tempDiscordData, setTempDiscordData] = useState<string[]>([]);
  const [editingSequence, setEditingSequence] = useState<string | null>(null);
  const [sequenceMode, setSequenceMode] = useState<'manual' | 'auto'>('auto');
  const [disqualifyingTeam, setDisqualifyingTeam] = useState<string | null>(null);
  const [disqualificationReason, setDisqualificationReason] = useState('');

  // Generate random team names
  const generateRandomTeamNames = () => {
    const adjectives = ['Swift', 'Thunder', 'Shadow', 'Crystal', 'Phoenix', 'Dragon', 'Storm', 'Blaze', 'Frost', 'Iron', 'Steel', 'Golden', 'Silver', 'Mystic', 'Cosmic', 'Neon'];
    const nouns = ['Warriors', 'Legends', 'Champions', 'Masters', 'Titans', 'Guardians', 'Destroyers', 'Conquerors', 'Vikings', 'Knights', 'Samurai', 'Ninjas', 'Pirates', 'Gladiators', 'Heroes', 'Challengers'];
    
    const teams = [];
    const usedNames = new Set();
    
    for (let i = 0; i < 16; i++) {
      let teamName;
      let attempts = 0;
      
      // Ensure unique team names
      do {
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        teamName = `${adjective} ${noun}`;
        attempts++;
      } while (usedNames.has(teamName) && attempts < 100);
      
      teams.push(teamName);
      usedNames.add(teamName);
    }
    
    console.log(`🏆 Generated ${teams.length} unique team names:`, teams);
    return teams;
  };

  // Helper function to get next round in tournament
  const getNextRound = (currentRound: string): string => {
    const roundProgression: { [key: string]: string } = {
      'Round of 64': 'Round of 32',
      'Round of 32': 'Round of 16', 
      'Round of 16': 'Quarterfinals',
      'Quarterfinals': 'Semifinals',
      'Semifinals': 'Finals',
      'Finals': 'Completed'
    };
    
    return roundProgression[currentRound] || 'Finals';
  };

  // Generate tournament matches automatically
  const generateMatches = async () => {
    if (!confirm('This will generate the tournament bracket and close registration. Continue?')) {
      return;
    }

    setIsGeneratingMatches(true);
    setMessage('');

    try {
      // Get the current tournament ID
      const { getTournaments } = await import('@/lib/firebase-database');
      const tournaments = await getTournaments();
      
      if (tournaments.length === 0) {
        setMessage('❌ No tournaments found.');
        return;
      }
      
      const tournamentId = tournaments[0].id || tournaments[0].name?.toLowerCase().replace(/\s+/g, '-');
      
      // Generate matches using the match making system
      const result = await generateTournamentMatches(tournamentId);
      
      // Load the generated matches
      const matchesData = await getMatches(tournamentId);
      // Deduplicate matches by ID to prevent React key conflicts
      const uniqueMatches = matchesData.filter((match, index, self) => 
        index === self.findIndex((m) => m.id === match.id)
      );
      setMatches(uniqueMatches);
      
      // Update tournament status in database
      const { updateDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const tournamentRef = doc(db, 'tournaments', tournamentId);
      await updateDoc(tournamentRef, { 
        status: 'matches_generated',
        matchesGenerated: true
      });
      
      // Update local state
      setTournamentStatus('matches_generated');
      
      // Refresh tournament data
      const updatedTournaments = await getTournaments();
      if (updatedTournaments.length > 0) {
        setTournament(updatedTournaments[0]);
      }
      
      setMessage(`✅ Tournament bracket generated successfully! ${result.totalTeams} teams in ${result.bracketSize}-team bracket with ${result.matches.length} matches.`);
      
    } catch (error) {
      setMessage('❌ Error generating matches. Please try again.');
      console.error('Match generation error:', error);
    } finally {
      setIsGeneratingMatches(false);
    }
  };

  // Fill tournament with sample data
  const fillSampleData = async () => {
    if (!confirm('This will fill tournament with 16 random sample teams. Continue?')) {
      return;
    }

    setIsFillingSampleData(true);
    
    try {
      // Get the current tournament ID
      const { getTournaments } = await import('@/lib/firebase-database');
      const tournaments = await getTournaments();
      
      if (tournaments.length === 0) {
        setMessage('❌ No tournaments found. Please create a tournament first.');
        return;
      }
      
      const tournamentId = tournaments[0].id || tournaments[0].name?.toLowerCase().replace(/\s+/g, '-');
      
      // Generate random teams (16 teams for proper tournament bracket)
      const teamNames = generateRandomTeamNames();
      console.log(`📊 Generated ${teamNames.length} team names for sample data`);
      
      // Create sample team data for Firebase
      const sampleTeams = teamNames.map((teamName, index) => ({
        name: teamName,
        captain: `Player${index + 1}`,
        members: [`Player${index + 1}`, `Player${index + 2}`, `Player${index + 3}`],
        discord: `user${index + 1}#${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
        memberDiscords: [
          `user${index + 1}#${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
          `user${index + 2}#${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
          `user${index + 3}#${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
        ],
        rewardReceiver: `Player${index + 1}`,
        tournamentId: tournamentId,
        status: 'registered' as const,
        registeredAt: new Date().toISOString()
      }));

      console.log(`📝 Created ${sampleTeams.length} sample teams to register`);
      console.log(`📝 Sample teams:`, sampleTeams.map(t => t.name));

      // Save all teams to Firebase
      for (const teamData of sampleTeams) {
        await registerTeam(teamData);
        console.log(`✅ Registered team: ${teamData.name}`);
      }
      
      console.log(`🎯 All ${sampleTeams.length} teams registered successfully`);
      
      // NOTE: We do NOT update matches here to prevent auto-creation
      // Matches should only be generated manually via the "Generate Matches" button
      
      setTeamCount(16);
      
      // Only close registration if tournament is full
      const currentTeamCount = 16;
      const maxSlots = tournaments[0]?.maxSlots || 16;
      if (currentTeamCount >= maxSlots) {
        setTournamentStatus('closed');
        setMessage('✅ Tournament filled with 16 sample teams! Registration is now full.');
      } else {
        setMessage('✅ 16 sample teams added successfully! Registration still open.');
      }
      
    } catch (error) {
      setMessage('❌ Error filling sample data. Please try again.');
      console.error('Sample data error:', error);
    } finally {
      setIsFillingSampleData(false);
    }
  };

  // Initialize matches for tournament
  const initializeMatches = async () => {
    try {
      // Get the current tournament ID
      const { getTournaments } = await import('@/lib/firebase-database');
      const tournaments = await getTournaments();
      
      if (tournaments.length === 0) {
        console.log('No tournaments found');
        return;
      }
      
      const tournamentId = tournaments[0].id || tournaments[0].name?.toLowerCase().replace(/\s+/g, '-');
      
      // Create initial matches structure
      const initialMatches: Match[] = [
        // Round of 16
        { id: 'match-1', tournamentId, round: 'Round of 16', player1: 'TBD', player2: 'TBD', status: 'upcoming', result: null, scheduledTime: '2024-01-15T14:00:00Z' },
        { id: 'match-2', tournamentId, round: 'Round of 16', player1: 'TBD', player2: 'TBD', status: 'upcoming', result: null, scheduledTime: '2024-01-15T14:30:00Z' },
        { id: 'match-3', tournamentId, round: 'Round of 16', player1: 'TBD', player2: 'TBD', status: 'upcoming', result: null, scheduledTime: '2024-01-15T15:00:00Z' },
        { id: 'match-4', tournamentId, round: 'Round of 16', player1: 'TBD', player2: 'TBD', status: 'upcoming', result: null, scheduledTime: '2024-01-15T15:30:00Z' },
        { id: 'match-5', tournamentId, round: 'Round of 16', player1: 'TBD', player2: 'TBD', status: 'upcoming', result: null, scheduledTime: '2024-01-15T16:00:00Z' },
        { id: 'match-6', tournamentId, round: 'Round of 16', player1: 'TBD', player2: 'TBD', status: 'upcoming', result: null, scheduledTime: '2024-01-15T16:30:00Z' },
        { id: 'match-7', tournamentId, round: 'Round of 16', player1: 'TBD', player2: 'TBD', status: 'upcoming', result: null, scheduledTime: '2024-01-15T17:00:00Z' },
        { id: 'match-8', tournamentId, round: 'Round of 16', player1: 'TBD', player2: 'TBD', status: 'upcoming', result: null, scheduledTime: '2024-01-15T17:30:00Z' },
        // Quarterfinals
        { id: 'match-9', tournamentId, round: 'Quarterfinals', player1: 'Winner Match 1', player2: 'Winner Match 2', status: 'upcoming', result: null, scheduledTime: '2024-01-15T18:00:00Z' },
        { id: 'match-10', tournamentId, round: 'Quarterfinals', player1: 'Winner Match 3', player2: 'Winner Match 4', status: 'upcoming', result: null, scheduledTime: '2024-01-15T18:30:00Z' },
        { id: 'match-11', tournamentId, round: 'Quarterfinals', player1: 'Winner Match 5', player2: 'Winner Match 6', status: 'upcoming', result: null, scheduledTime: '2024-01-15T19:00:00Z' },
        { id: 'match-12', tournamentId, round: 'Quarterfinals', player1: 'Winner Match 7', player2: 'Winner Match 8', status: 'upcoming', result: null, scheduledTime: '2024-01-15T19:30:00Z' },
        // Semifinals
        { id: 'match-13', tournamentId, round: 'Semifinals', player1: 'Winner Match 13', player2: 'Winner Match 10', status: 'upcoming', result: null, scheduledTime: '2024-01-15T20:00:00Z' },
        { id: 'match-14', tournamentId, round: 'Semifinals', player1: 'Winner Match 11', player2: 'Winner Match 12', status: 'upcoming', result: null, scheduledTime: '2024-01-15T20:30:00Z' },
        // Finals
        { id: 'match-15', tournamentId, round: 'Finals', player1: 'Winner Match 13', player2: 'Winner Match 14', status: 'upcoming', result: null, scheduledTime: '2024-01-15T21:00:00Z' }
      ];

      await updateMatches(initialMatches);
      setMatches(initialMatches);
    } catch (error) {
      console.error('Error initializing matches:', error);
    }
  };

  // Load matches from database
  const loadMatches = async () => {
    try {
      console.log('🔄 Loading matches from database...');
      
      // Get the current tournament ID
      const { getTournaments, getMatches } = await import('@/lib/firebase-database');
      const tournaments = await getTournaments();
      
      if (tournaments.length === 0) {
        console.log('❌ No tournaments found');
        return;
      }
      
      const tournamentId = tournaments[0].id || tournaments[0].name?.toLowerCase().replace(/\s+/g, '-');
      console.log(`📋 Using tournament ID: ${tournamentId}`);
      
      // Force refresh by adding timestamp to query
      console.log('🔍 Querying matches with fresh data...');
      const matchesData = await getMatches(tournamentId);
      console.log(`📊 Found ${matchesData.length} matches in database`);
      
      // Log each match for debugging
      matchesData.forEach((match, index) => {
        console.log(`📝 Match ${index + 1}: ID=${match.id}, Status=${match.status}, Result=${match.result}`);
      });
      
      // Log match statuses for debugging
      const statusCounts = matchesData.reduce((acc, match) => {
        acc[match.status] = (acc[match.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('📈 Match status counts:', statusCounts);
      
      // Deduplicate matches by ID to prevent React key conflicts
      const uniqueMatches = matchesData.filter((match, index, self) => 
        index === self.findIndex((m) => m.id === match.id)
      );
      console.log(`🔍 Deduplicated to ${uniqueMatches.length} unique matches`);
      
      setMatches(uniqueMatches);
      
      // Set tournament data for winner display
      setTournament(tournaments[0]);
      
      console.log('🏆 Tournament data loaded:', {
        status: tournaments[0].status,
        winner: tournaments[0].winner,
        winnerTeam: tournaments[0].winnerTeam,
        completedAt: tournaments[0].completedAt
      });
      
      console.log('✅ Matches loaded and state updated');
    } catch (error) {
      console.error('❌ Error loading matches:', error);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const sendRulesAnnouncement = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    
    try {
      const response = await fetch('/api/discord/rules-announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          channelId: '1486293985843482774',
          type: 'rules_announcement'
        }),
      });

      if (response.ok) {
        setMessage('');
        alert('Rules announcement sent successfully to Discord!');
      } else {
        alert('Failed to send announcement. Please try again.');
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      alert('Error sending announcement. Please check console.');
    } finally {
      setIsSending(false);
    }
  };

  const resetMatches = async () => {
    if (!confirm('Are you sure you want to reset all matches? This will delete all generated matches and reset the tournament winner for the current tournament.')) {
      return;
    }
    
    setIsUpdating(true);
    try {
      const { resetTournamentMatches, resetTournamentWinner } = await import('@/lib/firebase-database');
      
      // Reset matches
      await resetTournamentMatches('pYKa4M27SfgwxGoAYPRs'); // Current tournament ID
      
      // Reset tournament winner and status
      await resetTournamentWinner('pYKa4M27SfgwxGoAYPRs');
      
      // Refresh tournament data to clear winner display
      const { getTournaments } = await import('@/lib/firebase-database');
      const updatedTournaments = await getTournaments();
      if (updatedTournaments.length > 0) {
        setTournament(updatedTournaments[0]);
        console.log(`✅ Tournament state reset:`, {
          status: updatedTournaments[0].status,
          winner: updatedTournaments[0].winner,
          winnerTeam: updatedTournaments[0].winnerTeam,
          completedAt: updatedTournaments[0].completedAt
        });
      }
      
      setMessage('All matches and tournament winner have been reset successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error resetting matches:', error);
      setMessage('Error resetting matches. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Auto-assign sequence numbers to all teams
  const autoAssignSequences = async () => {
    if (!confirm('Auto-assign registration sequences to all teams? This will number teams based on their registration time.')) {
      return;
    }
    
    try {
      const { updateTeam } = await import('@/lib/firebase-database');
      
      // Sort teams by registration time
      const sortedTeams = [...teams].sort((a, b) => {
        const dateA = new Date(a.registeredAt).getTime();
        const dateB = new Date(b.registeredAt).getTime();
        return dateA - dateB;
      });
      
      // Update each team with sequence number
      for (let i = 0; i < sortedTeams.length; i++) {
        const team = sortedTeams[i];
        await updateTeam(team.id, {
          registrationSequence: i + 1
        });
      }
      
      // Refresh teams data
      const { getTeams } = await import('@/lib/firebase-database');
      const tournamentId = tournament?.id || 'pYKa4M27SfgwxGoAYPRs';
      const updatedTeams = await getTeams(tournamentId);
      setTeams(updatedTeams);
      
      alert(`✅ Auto-assigned sequences to ${sortedTeams.length} teams based on registration time!`);
    } catch (error) {
      console.error('Error auto-assigning sequences:', error);
      alert('❌ Failed to auto-assign sequences');
    }
  };

  // Start manual sequence editing
  const startEditingSequence = () => {
    setEditingSequence('manual');
    // Create a copy of teams for editing
    setTempDiscordData(teams.map(t => String(t.registrationSequence || '')));
  };

  // Cancel sequence editing
  const cancelEditingSequence = () => {
    setEditingSequence(null);
    setTempDiscordData([]);
  };

  // Save manual sequences
  const saveManualSequences = async () => {
    try {
      const { updateTeam } = await import('@/lib/firebase-database');
      
      // Update each team with its sequence
      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        const sequence = parseInt(tempDiscordData[i]) || i + 1;
        
        await updateTeam(team.id, {
          registrationSequence: sequence
        });
      }
      
      // Refresh teams data
      const { getTeams } = await import('@/lib/firebase-database');
      const tournamentId = tournament?.id || 'pYKa4M27SfgwxGoAYPRs';
      const updatedTeams = await getTeams(tournamentId);
      setTeams(updatedTeams);
      
      alert('✅ Manual sequences saved successfully!');
      cancelEditingSequence();
    } catch (error) {
      console.error('Error saving manual sequences:', error);
      alert('❌ Failed to save sequences');
    }
  };

  // Update sequence for a specific team
  const updateSequenceForTeam = (teamIndex: number, value: string) => {
    const updated = [...tempDiscordData];
    updated[teamIndex] = value;
    setTempDiscordData(updated);
  };

  // Start editing Discord information for a team
  const startEditingDiscord = (team: any) => {
    setEditingTeamDiscord(team.id || team.name);
    // Initialize with existing memberDiscords or create array with captain Discord
    const existingDiscords = team.memberDiscords || [team.discord];
    // Ensure array length matches members count
    const discordArray = [...existingDiscords];
    while (discordArray.length < team.members.length) {
      discordArray.push('');
    }
    setTempDiscordData(discordArray);
  };

  // Cancel editing Discord information
  const cancelEditingDiscord = () => {
    setEditingTeamDiscord(null);
    setTempDiscordData([]);
  };

  // Save Discord information for a team
  const saveTeamDiscord = async (team: any) => {
    try {
      const { updateTeam } = await import('@/lib/firebase-database');
      
      // Update team with new Discord information
      await updateTeam(team.id, {
        memberDiscords: tempDiscordData
      });

      // Update local state
      const updatedTeams = teams.map(t => 
        t.id === team.id ? { ...t, memberDiscords: tempDiscordData } : t
      );
      setTeams(updatedTeams);

      alert(`✅ Discord information updated for team: ${team.name}`);
      cancelEditingDiscord();
    } catch (error) {
      console.error('Error updating team Discord info:', error);
      alert('❌ Failed to update Discord information');
    }
  };

  // Update Discord data for a specific member
  const updateDiscordForMember = (memberIndex: number, value: string) => {
    const updated = [...tempDiscordData];
    updated[memberIndex] = value;
    setTempDiscordData(updated);
  };

  // Resend Discord notification for a single team
  const resendSingleTeamNotification = async (team: any) => {
    if (!confirm(`Resend Discord notification for team "${team.name}"?`)) {
      return;
    }
    
    try {
      const response = await fetch('/api/discord/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team: {
            ...team,
            discordUsers: team.memberDiscords || [team.discord]
          },
          tournament: tournament
        })
      });

      if (response.ok) {
        alert(`✅ Discord notification sent for team: ${team.name}`);
        console.log(`✅ Discord notification resent for team: ${team.name}`);
      } else {
        const errorText = await response.text();
        alert(`❌ Failed to send notification for team ${team.name}: ${errorText}`);
        console.error(`❌ Failed to resend notification for team ${team.name}:`, errorText);
      }
    } catch (error) {
      alert(`❌ Error sending notification for team ${team.name}`);
      console.error(`❌ Error resending notification for team ${team.name}:`, error);
    }
  };

  // Resend Discord notifications for all registered teams
  const resendDiscordNotifications = async () => {
    if (!confirm('Are you sure you want to resend Discord notifications for all registered teams? This will send a message for each team in registration order.')) {
      return;
    }
    
    setIsResendingDiscord(true);
    setMessage('🔄 Resending Discord notifications for all teams in registration order...');
    
    try {
      if (!tournament) {
        setMessage('❌ No tournament loaded');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Sort teams by registration sequence (1st, 2nd, 3rd, etc.)
      // Teams without sequence go to the end
      const sortedTeams = [...teams].sort((a, b) => {
        const seqA = a.registrationSequence || 999;
        const seqB = b.registrationSequence || 999;
        return seqA - seqB;
      });

      console.log('📋 Sending notifications in registration order:', sortedTeams.map(t => `${t.name} (#${t.registrationSequence || '?'})`));

      // Send notification for each team in order
      for (const team of sortedTeams) {
        try {
          const response = await fetch('/api/discord/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              team: {
                ...team,
                discordUsers: team.memberDiscords || [team.discord] // Use stored memberDiscords or fallback to captain discord
              },
              tournament: tournament
            })
          });

          if (response.ok) {
            successCount++;
            console.log(`✅ Discord notification resent for team: ${team.name} (#${team.registrationSequence || '?'})`);
          } else {
            errorCount++;
            const errorText = await response.text();
            console.error(`❌ Failed to resend notification for team ${team.name} (#${team.registrationSequence || '?'}):`, errorText);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error resending notification for team ${team.name} (#${team.registrationSequence || '?'}):`, error);
        }

        // Add small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setMessage(`✅ Discord notifications resent! Success: ${successCount}, Errors: ${errorCount}`);
      
    } catch (error) {
      console.error('Error in bulk Discord resend:', error);
      setMessage('❌ Failed to resend Discord notifications');
    } finally {
      setIsResendingDiscord(false);
    }
  };

  const resetTeams = async () => {
    if (!confirm('Are you sure you want to reset all teams? This will delete all registered teams.')) {
      return;
    }
    
    setIsResetting(true);
    try {
      const { resetTournamentTeams } = await import('@/lib/firebase-database');
      await resetTournamentTeams('pYKa4M27SfgwxGoAYPRs'); // Current tournament ID
      setTeamCount(0);
      setMessage('All teams have been reset successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error resetting teams:', error);
      setMessage('Error resetting teams. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  // Disqualify a team
  const handleDisqualifyTeam = async (teamId: string, teamName: string) => {
    if (!disqualificationReason.trim()) {
      alert('Please provide a reason for disqualification');
      return;
    }
    
    // Check if there are active matches
    const activeMatches = matches.filter(match => 
      match.status !== 'completed' && 
      (match.player1 === teamName || match.player2 === teamName)
    );
    
    let confirmMessage = `Are you sure you want to disqualify "${teamName}"?\n\nReason: ${disqualificationReason}`;
    
    if (activeMatches.length > 0) {
      confirmMessage += `\n\n⚠️ WARNING: This team has ${activeMatches.length} active match(es) that will be affected:\n`;
      activeMatches.forEach(match => {
        confirmMessage += `• ${match.round}: ${match.player1} vs ${match.player2}\n`;
      });
      confirmMessage += `\nThe opponent(s) will automatically win these matches.`;
    }
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      const { disqualifyTeam, handleDisqualificationImpact } = await import('@/lib/firebase-database');
      
      // First, disqualify the team
      await disqualifyTeam(teamId, disqualificationReason, 'Admin');
      
      // Then handle the impact on matches
      if (activeMatches.length > 0) {
        await handleDisqualificationImpact(tournament?.id || 'pYKa4M27SfgwxGoAYPRs', teamName);
        
        // Refresh matches data
        const { getMatches } = await import('@/lib/firebase-database');
        const updatedMatches = await getMatches(tournament?.id || 'pYKa4M27SfgwxGoAYPRs');
        setMatches(updatedMatches);
      }
      
      // Refresh teams data
      const { getTeams } = await import('@/lib/firebase-database');
      const tournamentId = tournament?.id || 'pYKa4M27SfgwxGoAYPRs';
      const updatedTeams = await getTeams(tournamentId);
      setTeams(updatedTeams);
      
      let successMessage = `✅ Team "${teamName}" has been disqualified`;
      if (activeMatches.length > 0) {
        successMessage += ` and ${activeMatches.length} match(es) have been updated automatically`;
      }
      
      setMessage(successMessage);
      setDisqualifyingTeam(null);
      setDisqualificationReason('');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error disqualifying team:', error);
      setMessage('❌ Failed to disqualify team and update matches');
    }
  };

  // Reinstate a disqualified team
  const handleReinstateTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to reinstate "${teamName}"?`)) {
      return;
    }
    
    try {
      const { reinstateTeam } = await import('@/lib/firebase-database');
      await reinstateTeam(teamId, 'Admin');
      
      // Refresh teams data
      const { getTeams } = await import('@/lib/firebase-database');
      const tournamentId = tournament?.id || 'pYKa4M27SfgwxGoAYPRs';
      const updatedTeams = await getTeams(tournamentId);
      setTeams(updatedTeams);
      
      setMessage(`✅ Team "${teamName}" has been reinstated`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error reinstating team:', error);
      setMessage('❌ Failed to reinstate team');
    }
  };

  // Start disqualification process
  const startDisqualification = (teamId: string) => {
    setDisqualifyingTeam(teamId);
    setDisqualificationReason('');
  };

  // Cancel disqualification
  const cancelDisqualification = () => {
    setDisqualifyingTeam(null);
    setDisqualificationReason('');
  };

  useEffect(() => {
    // Check current team count and status
    const loadTeams = async () => {
      try {
        // Get all tournaments first to find the active one
        const { getTournaments } = await import('@/lib/firebase-database');
        const tournaments = await getTournaments();
        
        if (tournaments.length === 0) {
          console.log('No tournaments found');
          setTeamCount(0);
          setTournamentStatus('open');
          return;
        }
        
        // Use first tournament (or you could make this configurable)
        const tournamentId = tournaments[0].id || tournaments[0].name?.toLowerCase().replace(/\s+/g, '-');
        const teams = await getTeams(tournamentId);
        setTeamCount(teams.length);
        setTeams(teams); // Store teams for debugging
        setTournamentStatus(teams.length >= 16 ? 'closed' : 'open');
      } catch (error) {
        console.error('Error loading teams:', error);
        setTeamCount(0);
        setTournamentStatus('open');
      }
    };

    loadTeams();
  }, []);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all registrations? This action cannot be undone!')) {
      return;
    }

    setIsResetting(true);
    setMessage('');

    try {
      // Get the current tournament ID
      const { getTournaments } = await import('@/lib/firebase-database');
      const tournaments = await getTournaments();
      
      if (tournaments.length === 0) {
        setMessage('❌ No tournaments found to reset.');
        return;
      }
      
      const tournamentId = tournaments[0].id || tournaments[0].name?.toLowerCase().replace(/\s+/g, '-');
      
      // Reset all tournament teams from Firebase
      await resetTournamentTeams(tournamentId);
      
      // Reset all tournament matches from Firebase
      await resetTournamentMatches(tournamentId);
      
      // NOTE: We do NOT initialize matches here to prevent auto-creation
      // Matches should only be generated manually via the "Generate Matches" button
      
      setMessage('✅ All registrations and matches have been reset successfully!');
      setTeamCount(0);
      setTournamentStatus('open');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/tournaments/${tournamentId}`);
      }, 2000);
      
    } catch (error) {
      setMessage('❌ Error resetting registrations. Please try again.');
      console.error('Reset error:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const startMatch = async (matchId: string) => {
    try {
      console.log(`🚀 Starting match: ${matchId}`);
      
      // Update single match in database first
      await updateSingleMatch(matchId, { status: 'live' });
      
      console.log(`✅ Database updated for match ${matchId}`);
      
      // Then update local state
      const updatedMatches = matches.map(match =>
        match.id === matchId ? { 
          ...match, 
          status: 'live' as const
        } : match
      );
      setMatches(updatedMatches);
      
      console.log(`✅ Local state updated for match ${matchId}`);
      
      // Dispatch custom event to update matches page
      window.dispatchEvent(new CustomEvent('matchUpdate', {
        detail: { 
          action: 'start', 
          matchId, 
          status: 'live',
          timestamp: Date.now()
        }
      }));
      
      console.log(`✅ Match ${matchId} started and marked as live`);
    } catch (error) {
      console.error('Error starting match:', error);
      // Reload matches from database to sync state
      await loadMatches();
    }
  };

  const completeMatch = async () => {
    if (!selectedMatch || !winner) return;

    try {
      console.log(`🏆 Completing match: ${selectedMatch.id}, winner: ${winner}`);
      
      // Update single match in database first
      await updateSingleMatch(selectedMatch.id, { 
        status: 'completed', 
        result: winner 
      });
      
      console.log(`✅ Database updated for match ${selectedMatch.id}`);
      
      // Update local state
      const updatedMatches = matches.map(match => {
        if (match.id === selectedMatch.id) {
          return { ...match, status: 'completed' as const, result: winner };
        }
        return match;
      });
      setMatches(updatedMatches);
      
      console.log(`✅ Local state updated for match ${selectedMatch.id}`);

      console.log(`✅ Match ${selectedMatch.id} completed with winner: ${winner}`);

      // Check if this is the final match (Finals round)
      if (selectedMatch.round === 'Finals') {
        console.log(`🏆 TOURNAMENT COMPLETED! Winner: ${winner}`);
        
        // Update tournament with winner
        const { getTournaments } = await import('@/lib/firebase-database');
        const tournaments = await getTournaments();
        if (tournaments.length > 0) {
          const tournamentId = tournaments[0].id || tournaments[0].name?.toLowerCase().replace(/\s+/g, '-');
          const { updateTournamentWinner } = await import('@/lib/firebase-database');
          await updateTournamentWinner(tournamentId, winner);
          
          console.log(`✅ Tournament status updated to completed`);
          
          // Refresh tournament data to get updated status
          const updatedTournaments = await getTournaments();
          if (updatedTournaments.length > 0) {
            setTournament(updatedTournaments[0]);
            console.log(`✅ Tournament state refreshed:`, {
              status: updatedTournaments[0].status,
              winner: updatedTournaments[0].winner,
              winnerTeam: updatedTournaments[0].winnerTeam,
              completedAt: updatedTournaments[0].completedAt
            });
          }
          
          // Show tournament completed message
          alert(`🏆 TOURNAMENT COMPLETED! 🏆\n\nWinner: ${winner}\n\nThe tournament has been marked as completed and the winner has been saved.`);
        }
      }

      // Update next round matches with winners using the updated matches
      await updateNextRoundMatches(selectedMatch, winner, matches);
      
      setSelectedMatch(null);
      setWinner('');
      
      // Dispatch custom event to update matches page
      window.dispatchEvent(new CustomEvent('matchUpdate', {
        detail: { 
          action: 'complete', 
          matchId: selectedMatch.id, 
          winner,
          status: 'completed',
          timestamp: Date.now()
        }
      }));
      
      console.log(`✅ Event dispatched for match completion`);
    } catch (error) {
      console.error('Error completing match:', error);
      // Reload matches from database to sync state
      await loadMatches();
    }
  };

const updateNextRoundMatches = async (completedMatch: Match, winner: string, currentMatches: Match[]) => {
    const currentRoundMatches = currentMatches.filter(m => m.round === completedMatch.round);
    const currentMatchIndex = currentRoundMatches.findIndex(m => m.id === completedMatch.id);
    
    console.log(`📊 Current round matches: ${currentRoundMatches.length}`);
    console.log(`📊 Current match index: ${currentMatchIndex}`);
    console.log(`📊 Current round matches:`, currentRoundMatches.map(m => ({id: m.id, player1: m.player1, player2: m.player2})));
    
    // Calculate which slot in next round this winner should fill
    const nextRoundSlotIndex = Math.floor(currentMatchIndex / 2);
    const nextRound = getNextRound(completedMatch.round);
    
    console.log(`📊 Next round slot index: ${nextRoundSlotIndex}`);
    console.log(`📊 Next round: ${nextRound}`);

    const nextRoundMatches = currentMatches.filter(m => m.round === nextRound);
    const targetMatch = nextRoundMatches[nextRoundSlotIndex];
    
    console.log(`📊 Next round matches:`, nextRoundMatches.map(m => ({id: m.id, player1: m.player1, player2: m.player2})));
    console.log(`🎯 Target match:`, targetMatch ? {id: targetMatch.id, player1: targetMatch.player1, player2: targetMatch.player2} : 'Not found');
    
    if (targetMatch) {
      try {
        // Update the specific match in database
        // Find the current match to update
        const currentMatch = currentMatches.find(m => m.id === targetMatch.id);
        
        if (currentMatch) {
          const updateData: any = {};
          
          // Fill the first available slot (player1 or player2)
          if (currentMatch.player1 === 'TBD') {
            updateData.player1 = winner;
            console.log(`✅ Updated ${targetMatch.id}.player1 = ${winner}`);
          } else if (currentMatch.player2 === 'TBD') {
            updateData.player2 = winner;
            console.log(`✅ Updated ${targetMatch.id}.player2 = ${winner}`);
          }
          
          await updateSingleMatch(targetMatch.id, updateData);
          console.log(`✅ Updated next round match ${targetMatch.id} with winner: ${winner}`);
        }
      } catch (error) {
        console.error('❌ Error updating next round match:', error);
        setMessage('Error updating next round match');
      }
    }

    // Dispatch custom event to update matches page with next round changes
    window.dispatchEvent(new CustomEvent('matchUpdate', {
      detail: { 
        action: 'nextRound', 
        winner, 
        targetMatchId: targetMatch.id,
        round: targetMatch.round,
        timestamp: Date.now()
      }
    }));
  };

// Manual sync function to ensure both pages are synchronized
const syncMatches = async () => {
  console.log('🔄 Admin: Manual sync triggered');
  await loadMatches();
  
  // Dispatch sync event to notify matches page
  window.dispatchEvent(new CustomEvent('matchUpdate', {
    detail: { 
      action: 'sync', 
      timestamp: Date.now()
    }
  }));
};

  // Auto-sync every 30 seconds to ensure consistency
  useEffect(() => {
    const syncInterval = setInterval(() => {
      syncMatches();
    }, 30000); // 30 seconds

    return () => clearInterval(syncInterval);
  }, []);

  // Add keyboard shortcut for manual refresh (Ctrl+R)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        syncMatches();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Helper function to extract match number from ID
  const getMatchNumber = (matchId: string, round: string) => {
    const matchNum = matchId.match(/match-(\d+)$/);
    const globalMatchNumber = matchNum ? parseInt(matchNum[1]) : 1;
    
    // Calculate round-specific match number
    switch (round) {
      case 'Round of 16':
        return globalMatchNumber; // Matches 1-8
      case 'Quarterfinals':
        return globalMatchNumber - 8; // Matches 9-12 → 1-4
      case 'Semifinals':
        return globalMatchNumber - 12; // Matches 13-14 → 1-2
      case 'Finals':
        return globalMatchNumber - 14; // Match 15 → 1
      default:
        return globalMatchNumber;
    }
  };

  // Helper function to get round prefix
  const getRoundPrefix = (round: string) => {
    switch (round) {
      case 'Round of 16': return 'R16';
      case 'Quarterfinals': return 'QF';
      case 'Semifinals': return 'SF';
      case 'Finals': return 'F';
      default: return 'M';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500/20 text-red-400';
      case 'upcoming': return 'bg-amber-500/20 text-amber-400';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getRoundMatches = (round: string) => {
    return matches
      .filter(match => match.round === round)
      .sort((a, b) => {
        // Extract match numbers and sort by global match ID for consistent numbering
        const getGlobalMatchNumber = (matchId: string) => {
          const matchNum = matchId.match(/match-(\d+)$/);
          return matchNum ? parseInt(matchNum[1]) : 0;
        };
        
        const matchNumberA = getGlobalMatchNumber(a.id);
        const matchNumberB = getGlobalMatchNumber(b.id);
        
        return matchNumberA - matchNumberB;
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-12">
          
          {/* Header */}
          <section className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Link 
                  href="/tournaments"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors mb-4 inline-block"
                >
                  ← Back to Tournaments
                </Link>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">Admin Dashboard</h1>
                <p className="mt-2 text-slate-400">Manage tournament registrations and matches</p>
              </div>
              <button
                onClick={syncMatches}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>🔄</span>
                Refresh Data
              </button>
            </div>
          </section>

          
          {/* Tournament Winner Display */}
          {(() => {
            console.log('🔍 Checking winner display conditions:', {
              tournament: !!tournament,
              status: tournament?.status,
              winner: tournament?.winner,
              shouldShow: tournament?.status === 'completed' && tournament?.winner
            });
            return tournament && tournament.status === 'completed' && tournament.winner;
          })() && (
            <section className="card-glass p-6 mb-8 border-2 border-emerald-500/50">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 bg-emerald-500/20 backdrop-blur-sm px-6 py-3 rounded-full mb-4 border border-emerald-500/30">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                  <h2 className="text-2xl font-bold text-emerald-400">🏆 Tournament Completed! 🏆</h2>
                  <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/30">
                  <h3 className="text-xl font-semibold text-white mb-4">Champion</h3>
                  <div className="text-3xl font-bold text-emerald-400 mb-2">{tournament.winner}</div>
                  
                  {tournament.winnerTeam && (
                    <div className="mt-4 space-y-2">
                      <div className="text-sm text-slate-300">
                        <span className="font-semibold">Captain:</span> {tournament.winnerTeam.captain}
                      </div>
                      <div className="text-sm text-slate-300">
                        <span className="font-semibold">Team Members:</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {tournament.winnerTeam.members.map((member: string, index: number) => (
                          <div key={index} className="bg-emerald-500/20 rounded px-2 py-1 text-xs text-emerald-300">
                            <span className="font-medium">{member}</span>
                            {tournament.winnerTeam.memberDiscords && tournament.winnerTeam.memberDiscords[index] && (
                              <span className="ml-2 text-slate-400">({tournament.winnerTeam.memberDiscords[index]})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-sm text-slate-400">
                  Completed on: {tournament.completedAt ? new Date(tournament.completedAt).toLocaleString() : 'Unknown'}
                </div>
              </div>
            </section>
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
                    {selectedMatch.player1}
                  </button>
                  <button
                    onClick={() => setWinner(selectedMatch.player2)}
                    className={`w-full p-3 rounded border transition ${
                      winner === selectedMatch.player2
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {selectedMatch.player2}
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

          {/* Admin Actions */}
          <section className="card-glass p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Admin Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Team Registration Status */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">Team Registration</h3>
                <p className="text-3xl font-bold text-emerald-400">{teamCount}/16</p>
                <p className="text-slate-300 text-sm">Teams Registered</p>
              </div>

              {/* Tournament Status */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">Tournament Status</h3>
                <p className="text-xl font-semibold text-emerald-400 capitalize">{tournamentStatus}</p>
                <p className="text-slate-300 text-sm">Registration Status</p>
              </div>

              {/* Generate Matches Button */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">Match Making</h3>
                <div className="flex gap-3">
                  <button
                    onClick={generateMatches}
                    disabled={isUpdating || teamCount < 2}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? 'Generating...' : '🎯 Generate Bracket'}
                  </button>
                  
                  <button
                    onClick={resetMatches}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    🔄 Reset Matches
                  </button>
                </div>
                <p className="text-slate-300 text-sm mt-2">Auto-generate matches</p>
              </div>

              {/* Discord Notifications */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">Discord Notifications</h3>
                <div className="space-y-2">
                  <button
                    onClick={resendDiscordNotifications}
                    disabled={isResendingDiscord || teams.length === 0}
                    className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    {isResendingDiscord ? '⏳ Resending...' : '📨 Resend All Team Notifications'}
                  </button>
                  <p className="text-slate-300 text-xs">Resend Discord notifications for all registered teams</p>
                </div>
              </div>

              {/* Registration Sequence Management */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">Registration Sequence</h3>
                <div className="space-y-2">
                  <button
                    onClick={autoAssignSequences}
                    disabled={teams.length === 0}
                    className="w-full px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    🔄 Auto-Assign Sequences
                  </button>
                  <button
                    onClick={startEditingSequence}
                    disabled={teams.length === 0}
                    className="w-full px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    ✏️ Manual Sequence Edit
                  </button>
                  <p className="text-slate-300 text-xs">Manage registration order (1st, 2nd, 3rd...)</p>
                </div>
              </div>

              {/* Reset Data */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">Reset Data</h3>
                <div className="space-y-2">
                  <button
                    onClick={fillSampleData}
                    disabled={isFillingSampleData}
                    className="w-full px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    {isFillingSampleData ? '⏳ Filling...' : '🎲 Fill Sample Data'}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isResetting}
                    className="w-full px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    {isResetting ? '⏳ Resetting...' : '🗑️ Reset All'}
                  </button>
                </div>
                <p className="text-slate-300 text-sm mt-2">Clear all data</p>
              </div>
            </div>

            {/* Debug Section - Teams with Discord Info */}
            <section className="card-glass p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">🔍 Debug: Registered Teams (Discord Info)</h2>
              <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-sm text-blue-300 mb-2">
                  💡 <span className="font-semibold">Tip:</span> Use "📨 Resend All Team Notifications" to resend messages for teams that had Discord errors during registration.
                  Individual team resend buttons are available below.
                </p>
                <p className="text-sm text-blue-300 mb-2">
                  ✏️ <span className="font-semibold">New:</span> Click "✏️ Edit Discord" to manually add Discord usernames for old registrations that are missing Discord information.
                </p>
                <p className="text-sm text-blue-300">
                  🔢 <span className="font-semibold">New:</span> Use "🔄 Auto-Assign Sequences" to number teams by registration time, or "✏️ Manual Sequence Edit" to set custom order (1st, 2nd, 3rd...).
                </p>
              </div>
              {teams.length > 0 ? (
                <div className="space-y-4">
                  {teams.map((team, index) => (
                    <div key={team.id || index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-medium text-emerald-400 mb-2">
                            {team.name}
                            {team.registrationSequence && (
                              <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                                #{team.registrationSequence}
                              </span>
                            )}
                            {team.status === 'disqualified' ? (
                              <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">❌ Disqualified</span>
                            ) : team.memberDiscords && team.memberDiscords.length > 0 ? (
                              <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">✅ Discord Complete</span>
                            ) : (
                              <span className="ml-2 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded">⚠️ Discord Incomplete</span>
                            )}
                            {team.status !== 'disqualified' && matches.some(match => 
                              match.status !== 'completed' && 
                              (match.player1 === team.name || match.player2 === team.name)
                            ) && (
                              <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">🎮 Active Match</span>
                            )}
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-semibold text-white">Captain:</span> {team.captain}</p>
                            <p><span className="font-semibold text-white">Captain Discord:</span> {team.discord}</p>
                            <p><span className="font-semibold text-white">Reward Receiver:</span> {team.rewardReceiver}</p>
                            {team.status === 'disqualified' && (
                              <>
                                <p><span className="font-semibold text-red-400">Disqualified:</span> {team.disqualificationReason || 'No reason provided'}</p>
                                <p><span className="font-semibold text-red-400">Disqualified At:</span> {team.disqualifiedAt ? new Date(team.disqualifiedAt).toLocaleString() : 'Unknown'}</p>
                                <p><span className="font-semibold text-red-400">Disqualified By:</span> {team.disqualifiedBy || 'Unknown'}</p>
                              </>
                            )}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <button
                                onClick={() => resendSingleTeamNotification(team)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                              >
                                📨 Resend Notification
                              </button>
                              <button
                                onClick={() => startEditingDiscord(team)}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded transition-colors"
                              >
                                ✏️ Edit Discord
                              </button>
                              {team.status === 'disqualified' ? (
                                <button
                                  onClick={() => handleReinstateTeam(team.id, team.name)}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                >
                                  ✅ Reinstate Team
                                </button>
                              ) : (
                                <button
                                  onClick={() => startDisqualification(team.id)}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                >
                                  ❌ Disqualify Team
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-md font-medium text-blue-400 mb-2">Team Members & Discord</h4>
                          <div className="space-y-1 text-sm">
                            {team.members.map((member: string, memberIndex: number) => (
                              <div key={memberIndex} className="flex justify-between">
                                <span className="text-slate-300">{member}</span>
                                <span className="text-slate-400">
                                  {team.memberDiscords && team.memberDiscords[memberIndex] 
                                    ? team.memberDiscords[memberIndex] 
                                    : 'No Discord stored'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Discord Editing Interface */}
                      {editingTeamDiscord === (team.id || team.name) && (
                        <div className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                          <h4 className="text-md font-medium text-amber-400 mb-3">✏️ Edit Discord Usernames</h4>
                          <div className="space-y-2">
                            {team.members.map((member: string, memberIndex: number) => (
                              <div key={memberIndex} className="flex items-center gap-2">
                                <label className="text-sm text-slate-300 w-24">{member}:</label>
                                <input
                                  type="text"
                                  value={tempDiscordData[memberIndex] || ''}
                                  onChange={(e) => updateDiscordForMember(memberIndex, e.target.value)}
                                  placeholder="username#1234"
                                  className="flex-1 px-2 py-1 bg-slate-800/50 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => saveTeamDiscord(team)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition-colors"
                            >
                              💾 Save Changes
                            </button>
                            <button
                              onClick={cancelEditingDiscord}
                              className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No teams registered yet.</p>
              )}
            </section>

            {/* Disqualification Modal */}
            {disqualifyingTeam && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-slate-800 rounded-lg p-6 border border-white/20 max-w-md w-full mx-4">
                  <h3 className="text-lg font-medium text-red-400 mb-4">❌ Disqualify Team</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Reason for Disqualification
                      </label>
                      <textarea
                        value={disqualificationReason}
                        onChange={(e) => setDisqualificationReason(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                        rows={3}
                        placeholder="Enter the reason for disqualification..."
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const team = teams.find(t => t.id === disqualifyingTeam);
                          if (team) {
                            handleDisqualifyTeam(disqualifyingTeam, team.name);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        ❌ Disqualify Team
                      </button>
                      <button
                        onClick={cancelDisqualification}
                        className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-emerald-400 font-semibold mb-2">🔗 Quick Links</h3>
                <div className="space-y-2">
                  <Link
                    href="/tournaments/1/register"
                    className="block text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Team Registration
                  </Link>
                  <Link
                    href="/tournaments/1/rounds"
                    className="block text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Tournament Rounds
                  </Link>
                  <Link
                    href="/admin/time-preferences"
                    className="block text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    ⏰ Time Preferences
                  </Link>
                  <Link
                    href="/admin/team-messaging"
                    className="block text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    📨 Team Messaging
                  </Link>
                  <Link
                    href="/admin/discord-test"
                    className="block text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    🤖 Discord Test
                  </Link>
                  <Link
                    href="/message-sender"
                    className="block text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    📨 Send Message
                  </Link>
                  <Link
                    href="/matches"
                    className="block text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Live Matches
                  </Link>
                  <Link
                    href="/matches"
                    className="block text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Live Matches
                  </Link>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-emerald-400 font-semibold mb-2">📊 Tournament Info</h3>
                <div className="space-y-1 text-sm text-slate-300">
                  <p>Format: 4v4 BedWars</p>
                  <p>Max Teams: 16</p>
                  <p>Registration: {tournamentStatus === 'open' ? 'Open' : 'Closed'}</p>
                  <p>Current Teams: {teamCount}/16</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-emerald-400 font-semibold mb-2">🎮 Game Modes</h3>
                <div className="space-y-1 text-sm text-slate-300">
                  <p>• Solo Duels</p>
                  <p>• Duo Battles</p>
                  <p>• 4v4 Team Wars</p>
                  <p>• Custom Maps</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tournament Bracket Editor */}
          {matches.length > 0 && (
            <section className="mb-8">
              <BracketEditor
                matches={matches}
                teams={teams}
                onMatchesUpdate={(updatedMatches) => setMatches(updatedMatches)}
                tournamentId={tournament?.id || 'pYKa4M27SfgwxGoAYPRs'}
              />
            </section>
          )}

          {/* Legacy Match Management (for starting/completing matches) */}
          {matches.length > 0 && (
            <section className="card-glass p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-6">Match Control Panel</h2>
              
              <div className="space-y-6">
                {['Round of 16', 'Quarterfinals', 'Semifinals', 'Finals'].map((round) => {
                  const roundMatches = getRoundMatches(round);
                  return (
                    <div key={round} className="border border-white/10 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-3">{round}</h3>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {roundMatches.map((match) => {
                          const matchNumber = getMatchNumber(match.id, round);
                          const roundPrefix = getRoundPrefix(round);
                          
                          return (
                            <div key={match.id} className="bg-white/5 rounded p-3 border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                                    {match.status}
                                  </span>
                                  <span className="text-xs text-slate-400 font-medium bg-slate-700/50 px-2 py-1 rounded border border-white/10">
                                    {roundPrefix}-{matchNumber}
                                  </span>
                                </div>
                                <span className="text-xs text-slate-400">{match.scheduledTime}</span>
                              </div>
                              
                              <div className="text-sm space-y-1">
                                {match.result && (
                                  <div className="mt-2 text-center">
                                    <span className="text-xs font-medium text-emerald-400">Winner:</span>
                                    <div className="text-xs text-white">{match.result}</div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-sm space-y-1">
                                <div className="text-center font-medium text-white">{match.player1}</div>
                                <div className="text-center text-slate-400 text-xs">VS</div>
                                <div className="text-center font-medium text-white">{match.player2}</div>
                              </div>
                            
                            {match.status === 'upcoming' && (
                              <button
                                onClick={() => startMatch(match.id)}
                                className="w-full mt-2 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors"
                              >
                                Start Match
                              </button>
                            )}
                            
                            {match.status === 'live' && (
                              <button
                                onClick={() => {
                                  setSelectedMatch(match);
                                  setWinner('');
                                }}
                                className="w-full mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                              >
                                Complete Match
                              </button>
                            )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Winner Selection Modal */}
          {selectedMatch && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Select Winner</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setWinner(selectedMatch.player1)}
                    className={`w-full p-3 rounded-lg border transition-colors ${
                      winner === selectedMatch.player1
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
                    }`}
                  >
                    {selectedMatch.player1}
                  </button>
                  <button
                    onClick={() => setWinner(selectedMatch.player2)}
                    className={`w-full p-3 rounded-lg border transition-colors ${
                      winner === selectedMatch.player2
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
                    }`}
                  >
                    {selectedMatch.player2}
                  </button>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
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

          {/* Status Message */}
          {message && (
            <div className="card-glass p-4 mb-8">
              <p className="text-white">{message}</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
