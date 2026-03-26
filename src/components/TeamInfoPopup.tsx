'use client';

import { useState, useEffect } from 'react';

interface Team {
  id: string;
  name: string;
  captain: string;
  members: string[];
  discordTag?: string;
  email?: string;
}

interface TeamInfoPopupProps {
  teamId: string;
  teamName: string;
  onClose: () => void;
}

export default function TeamInfoPopup({ teamId, teamName, onClose }: TeamInfoPopupProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamInfo = async () => {
      try {
        const response = await fetch(`/api/teams/${teamId}`);
        if (response.ok) {
          const teamData = await response.json();
          setTeam(teamData);
        }
      } catch (error) {
        console.error('Error fetching team info:', error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId && teamId !== 'TBD') {
      fetchTeamInfo();
    } else {
      setLoading(false);
    }
  }, [teamId]);

  if (!teamId || teamId === 'TBD') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Team Information</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-300">Team information not available yet.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-white/10">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Team Information</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {team ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-2xl font-bold text-emerald-400 mb-2">{team.name}</h4>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-sm">👑</span>
                <span className="font-medium">Captain:</span>
                <span>{team.captain}</span>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-white mb-2">Team Members ({team.members?.length || 0})</h5>
              <div className="space-y-1">
                {team.members?.map((member, index) => (
                  <div key={index} className="flex items-center gap-2 text-slate-300">
                    <span className="text-xs">👤</span>
                    <span>{member}</span>
                  </div>
                ))}
              </div>
            </div>

            {team.discordTag && (
              <div>
                <h5 className="text-sm font-semibold text-white mb-1">Contact</h5>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-xs">💬</span>
                  <span>{team.discordTag}</span>
                </div>
              </div>
            )}

            {team.email && (
              <div>
                <h5 className="text-sm font-semibold text-white mb-1">Email</h5>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-xs">📧</span>
                  <span>{team.email}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-300">Team information not found.</p>
        )}
      </div>
    </div>
  );
}
