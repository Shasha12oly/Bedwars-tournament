import Link from 'next/link';
import { getTournamentsFromDatabase } from '@/lib/tournament-storage';
import { getAllMatches, generateTournamentBracket } from '@/lib/matches-storage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import MatchesClient from './MatchesClient';

export default async function Matches() {
  // Fetch tournaments from database
  const tournaments = await getTournamentsFromDatabase();
  const tournament = tournaments.find(t => t.id === '1') || tournaments[0];
  
  // Get matches data from JSON storage
  let matches = getAllMatches('1');
  console.log('🔍 Matches data from JSON storage:', matches);
  console.log('🔍 Tournament status:', tournament?.status);
  
  // Check if we need to regenerate matches with real team names
  const shouldRegenerate = tournament?.status === 'closed' && 
    matches.length > 0 && 
    (matches.some(m => m.player1.includes('TBD') || m.player1.match(/^Team \d+$/) || 
                   m.player2.includes('TBD') || m.player2.match(/^Team \d+$/)));
  
  // If no matches exist or registration is closed with placeholders, regenerate
  if (matches.length === 0 || shouldRegenerate) {
    console.log(shouldRegenerate ? 
      '⚠️ Registration closed with placeholders. Regenerating bracket with real team names...' :
      '⚠️ No matches found. Attempting to generate bracket...');
    try {
      // Generate matches from registered teams
      if (tournament) {
        matches = await generateTournamentBracket('1', tournament.name);
        console.log('✅ Bracket generated successfully with real team names');
      } else {
        console.log('❌ No tournament found to generate bracket');
        matches = [];
      }
    } catch (error) {
      console.error('❌ Error generating bracket:', error);
      matches = [];
    }
  }

  // Sort matches by round order and bracket position
  const roundOrder = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];
  matches = matches.sort((a, b) => {
    const roundDiff = roundOrder.indexOf(a.round) - roundOrder.indexOf(b.round);
    if (roundDiff !== 0) return roundDiff;
    return (a.bracketPosition || 0) - (b.bracketPosition || 0);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {tournament?.name || 'Blood Rush BedWars'} - Matches
            </h1>
            <p className="text-purple-200">
              Tournament Bracket & Schedule
            </p>
          </div>
          <Link 
            href="/admin"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Admin Panel
          </Link>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Tournament Bracket</h2>
            <div className="flex items-center gap-4">
              <span className="text-purple-200">
                {matches.length} Matches
              </span>
              <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-purple-300">
                {tournament?.format || 'rbw 4v4'}
              </span>
            </div>
          </div>

          <MatchesClient 
            initialMatches={matches}
            tournament={tournament}
          />
        </div>
      </div>
      
      <BottomNav />
      <Footer />
    </div>
  );
}
