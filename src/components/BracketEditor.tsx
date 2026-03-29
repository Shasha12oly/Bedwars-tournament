'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Match, Team } from '@/lib/firebase-database';

interface BracketEditorProps {
  matches: Match[];
  teams: Team[];
  onMatchesUpdate: (matches: Match[]) => void;
  tournamentId: string;
}

interface DragItem {
  teamName: string;
  sourceMatchId?: string;
  sourcePosition?: 'player1' | 'player2';
}

interface DropZone {
  matchId: string;
  position: 'player1' | 'player2';
}

export default function BracketEditor({ matches: initialMatches, teams, onMatchesUpdate, tournamentId }: BracketEditorProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverZone, setDragOverZone] = useState<DropZone | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  // Round order for sorting
  const roundOrder = ['Round of 64', 'Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Finals'];
  
  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  // Sort rounds in proper order
  const sortedRounds = Object.keys(matchesByRound).sort((a, b) => 
    roundOrder.indexOf(a) - roundOrder.indexOf(b)
  );

  const handleDragStart = (e: React.DragEvent, teamName: string, matchId: string, position: 'player1' | 'player2') => {
    if (!isEditing) return;
    
    setDraggedItem({
      teamName,
      sourceMatchId: matchId,
      sourcePosition: position
    });
    
    setDragStartPosition({ x: e.clientX, y: e.clientY });
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ teamName, matchId, position }));
    
    // Add custom drag image
    const dragImage = document.createElement('div');
    dragImage.className = 'bg-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium';
    dragImage.textContent = teamName;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverZone(null);
    setDragStartPosition(null);
  };

  const handleDragOver = (e: React.DragEvent, matchId: string, position: 'player1' | 'player2') => {
    if (!isEditing) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Only allow drop if it's not the same position and not a completed match
    const targetMatch = matches.find(m => m.id === matchId);
    if (targetMatch && targetMatch.status !== 'completed' && 
        !(draggedItem?.sourceMatchId === matchId && draggedItem?.sourcePosition === position)) {
      setDragOverZone({ matchId, position });
    }
  };

  const handleDragLeave = (e: React.DragEvent, matchId: string, position: 'player1' | 'player2') => {
    // Only clear if not dragging over a child element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (dragOverZone?.matchId === matchId && dragOverZone?.position === position) {
        setDragOverZone(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, targetMatchId: string, targetPosition: 'player1' | 'player2') => {
    e.preventDefault();
    setDragOverZone(null);
    
    if (!isEditing || !draggedItem) return;

    // Prevent dropping on the same position
    if (draggedItem.sourceMatchId === targetMatchId && draggedItem.sourcePosition === targetPosition) {
      setDraggedItem(null);
      return;
    }

    const updatedMatches = [...matches];
    
    // Find source and target matches
    const sourceMatchIndex = updatedMatches.findIndex(m => m.id === draggedItem.sourceMatchId);
    const targetMatchIndex = updatedMatches.findIndex(m => m.id === targetMatchId);
    
    if (sourceMatchIndex === -1 || targetMatchIndex === -1) {
      setDraggedItem(null);
      return;
    }

    const sourceMatch = updatedMatches[sourceMatchIndex];
    const targetMatch = updatedMatches[targetMatchIndex];
    
    // Get the team names before making changes
    const draggedTeamName = draggedItem.teamName;
    const targetTeamName = targetMatch[targetPosition];

    // Handle the swap/move
    if (draggedItem.sourceMatchId === targetMatchId) {
      // Same match - swap positions
      updatedMatches[sourceMatchIndex] = {
        ...sourceMatch,
        [targetPosition]: draggedTeamName,
        [draggedItem.sourcePosition!]: targetTeamName,
        status: 'upcoming' as const,
        result: null
      };
    } else {
      // Different matches - move team and preserve target
      updatedMatches[targetMatchIndex] = {
        ...targetMatch,
        [targetPosition]: draggedTeamName,
        status: 'upcoming' as const,
        result: null
      };
      
      updatedMatches[sourceMatchIndex] = {
        ...sourceMatch,
        [draggedItem.sourcePosition!]: targetTeamName || 'TBD',
        status: 'upcoming' as const,
        result: null
      };
    }

    setMatches(updatedMatches);
    setHasChanges(true);
    setDraggedItem(null);
  };

  const handleManualEdit = (matchId: string, position: 'player1' | 'player2', value: string) => {
    const updatedMatches = matches.map(match => {
      if (match.id === matchId) {
        return {
          ...match,
          [position]: value,
          status: 'upcoming' as const,
          result: null
        };
      }
      return match;
    });

    setMatches(updatedMatches);
    setHasChanges(true);
  };

  const saveChanges = async () => {
    try {
      const { updateSingleMatch } = await import('@/lib/firebase-database');
      
      // Update all matches in database
      for (const match of matches) {
        await updateSingleMatch(match.id, match);
      }
      
      onMatchesUpdate(matches);
      setHasChanges(false);
      setIsEditing(false);
      alert('✅ Bracket updated successfully!');
    } catch (error) {
      console.error('Error saving bracket:', error);
      alert('❌ Failed to save bracket changes');
    }
  };

  const cancelChanges = () => {
    setMatches(initialMatches);
    setHasChanges(false);
    setIsEditing(false);
  };

  const resetBracket = async () => {
    if (!confirm('Are you sure you want to reset the bracket to automatic generation?')) return;
    
    try {
      const { generateBracket } = await import('@/lib/firebase-database');
      const qualifiedTeams = teams.filter(team => team.status !== 'disqualified');
      const newMatches = await generateBracket(tournamentId, qualifiedTeams);
      
      setMatches(newMatches);
      onMatchesUpdate(newMatches);
      setHasChanges(false);
      setIsEditing(false);
      alert('✅ Bracket reset to automatic generation!');
    } catch (error) {
      console.error('Error resetting bracket:', error);
      alert('❌ Failed to reset bracket');
    }
  };

  const getAvailableTeams = () => {
    const usedTeams = new Set<string>();
    matches.forEach(match => {
      if (match.player1 && match.player1 !== 'TBD') usedTeams.add(match.player1);
      if (match.player2 && match.player2 !== 'TBD') usedTeams.add(match.player2);
    });
    
    return teams
      .filter(team => team.status !== 'disqualified' && !usedTeams.has(team.name))
      .map(team => team.name);
  };

  const isDropZoneActive = (matchId: string, position: 'player1' | 'player2') => {
    return dragOverZone?.matchId === matchId && dragOverZone?.position === position;
  };

  const isBeingDragged = (teamName: string) => {
    return draggedItem?.teamName === teamName;
  };

  return (
    <div className="bg-slate-900 rounded-lg p-6 border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-emerald-400">🏆 Tournament Bracket Editor</h2>
        
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              ✏️ Edit Bracket
            </button>
          ) : (
            <>
              {hasChanges && (
                <button
                  onClick={saveChanges}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  💾 Save Changes
                </button>
              )}
              <button
                onClick={cancelChanges}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                ❌ Cancel
              </button>
              <button
                onClick={resetBracket}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              >
                🔄 Auto Generate
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-blue-400 font-semibold mb-2">✏️ Editing Mode</h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Drag and drop teams between specific player positions</li>
            <li>• Click on team names to edit manually</li>
            <li>• Available teams: {getAvailableTeams().join(', ')}</li>
            <li>• Green highlight shows where you can drop teams</li>
            <li>• Click "Save Changes" when done</li>
          </ul>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Round Headers */}
          <div className="flex gap-8 mb-4">
            {sortedRounds.map(round => (
              <div key={round} className="flex-1 min-w-[220px]">
                <h3 className="text-center font-semibold text-purple-400 text-lg">{round}</h3>
              </div>
            ))}
          </div>

          {/* Matches Grid */}
          <div className="flex gap-8">
            {sortedRounds.map(round => (
              <div key={round} className="flex-1 min-w-[220px] space-y-4">
                {matchesByRound[round]?.sort((a, b) => {
                  // Sort matches within round by match number if available
                  const aNum = parseInt(a.scheduledTime.split(' ')[1]) || 0;
                  const bNum = parseInt(b.scheduledTime.split(' ')[1]) || 0;
                  return aNum - bNum;
                }).map(match => (
                  <div
                    key={match.id}
                    className={`bg-slate-800 rounded-lg p-4 border-2 transition-all ${
                      match.status === 'completed' ? 'opacity-75 border-slate-600' : 'border-white/10'
                    }`}
                  >
                    {/* Match Header */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-slate-400">
                        {match.scheduledTime}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        match.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        match.status === 'live' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-600 text-slate-300'
                      }`}>
                        {match.status}
                      </span>
                    </div>

                    {/* Players with Enhanced Drop Zones */}
                    <div className="space-y-3">
                      {['player1', 'player2'].map((position, index) => {
                        const playerName = match[position as keyof Match] as string;
                        const isDraggable = isEditing && playerName && playerName !== 'TBD' && match.status !== 'completed';
                        const isActiveDropZone = isDropZoneActive(match.id, position as 'player1' | 'player2');
                        const isBeingDraggedItem = isBeingDragged(playerName);
                        
                        return (
                          <div key={position}>
                            {/* Drop Zone Label */}
                            <div className="text-xs text-slate-500 mb-1">
                              {index === 0 ? 'Player 1' : 'Player 2'}
                            </div>
                            
                            {/* Enhanced Drop Zone */}
                            <div
                              className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                                isActiveDropZone 
                                  ? 'border-emerald-400 bg-emerald-500/20 scale-105 shadow-lg shadow-emerald-500/25' 
                                  : isDraggable 
                                    ? 'border-white/30 bg-slate-700/50 hover:border-blue-400 hover:bg-slate-700 cursor-move' 
                                    : 'border-slate-600 bg-slate-800'
                              } ${isBeingDraggedItem ? 'opacity-40 scale-95' : ''}`}
                              draggable={isDraggable ? true : undefined}
                              onDragStart={(e) => handleDragStart(e, playerName!, match.id, position as 'player1' | 'player2')}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleDragOver(e, match.id, position as 'player1' | 'player2')}
                              onDragLeave={(e) => handleDragLeave(e, match.id, position as 'player1' | 'player2')}
                              onDrop={(e) => handleDrop(e, match.id, position as 'player1' | 'player2')}
                            >
                              {/* Drop Zone Indicator */}
                              {isEditing && match.status !== 'completed' && (
                                <div className={`absolute inset-0 rounded-lg border-2 border-dashed transition-opacity ${
                                  isActiveDropZone 
                                    ? 'border-emerald-400 opacity-100' 
                                    : 'border-slate-600 opacity-0'
                                }`} />
                              )}
                              
                              {/* Drag Icon */}
                              {isDraggable && (
                                <div className="absolute top-2 right-2 text-slate-400 opacity-50">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                  </svg>
                                </div>
                              )}
                              
                              {/* Team Name */}
                              {isEditing && match.status !== 'completed' ? (
                                <input
                                  type="text"
                                  value={playerName || ''}
                                  onChange={(e) => handleManualEdit(match.id, position as 'player1' | 'player2', e.target.value)}
                                  className="w-full bg-transparent text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                                  placeholder={index === 0 ? 'Player 1' : 'Player 2'}
                                  list="available-teams"
                                />
                              ) : (
                                <div className="text-sm text-white font-medium">
                                  {playerName || 'TBD'}
                                </div>
                              )}
                              
                              {/* Drop Zone Hint */}
                              {isActiveDropZone && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-medium">
                                    Drop here
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* VS Indicator */}
                    <div className="relative my-2">
                      <div className="absolute left-1/2 transform -translate-x-1/2 text-xs text-slate-500 font-medium bg-slate-800 px-2 py-1 rounded">
                        VS
                      </div>
                      <div className="border-t border-slate-600"></div>
                    </div>

                    {/* Match Result */}
                    {match.result && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <p className="text-xs text-emerald-400 font-semibold">Winner: {match.result}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Datalist for available teams */}
      {isEditing && (
        <datalist id="available-teams">
          {getAvailableTeams().map(teamName => (
            <option key={teamName} value={teamName} />
          ))}
        </datalist>
      )}
    </div>
  );
}
