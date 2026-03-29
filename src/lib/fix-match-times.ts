import { getMatches, updateSingleMatch } from './firebase-database';

// Generate proper time slots for 15 matches from 3 PM to 8 PM
const generateMatchTimes = () => {
  const timeSlots = [
    '3:00 PM', '3:20 PM', '3:40 PM', '4:00 PM', '4:20 PM',
    '4:40 PM', '5:00 PM', '5:20 PM', '5:40 PM', '6:00 PM',
    '6:20 PM', '6:40 PM', '7:00 PM', '7:20 PM', '7:40 PM'
  ];
  return timeSlots;
};

// Function to fix all match times in the database
export async function fixAllMatchTimes(tournamentId: string = 'pYKa4M27SfgwxGoAYPRs') {
  try {
    console.log('🔧 Starting to fix match times...');
    
    // Get all matches from database
    const matches = await getMatches(tournamentId);
    console.log(`📊 Found ${matches.length} matches to update`);
    
    // Sort matches by round and then by ID to ensure consistent ordering
    const roundOrder = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Finals'];
    const sortedMatches = matches.sort((a, b) => {
      const aRoundIndex = roundOrder.indexOf(a.round);
      const bRoundIndex = roundOrder.indexOf(b.round);
      
      if (aRoundIndex !== bRoundIndex) {
        return aRoundIndex - bRoundIndex;
      }
      
      // Within the same round, sort by ID
      return a.id.localeCompare(b.id);
    });
    
    const timeSlots = generateMatchTimes();
    
    // Update each match with the correct time
    for (let i = 0; i < sortedMatches.length; i++) {
      const match = sortedMatches[i];
      const newTime = timeSlots[i];
      
      if (!newTime) {
        console.warn(`⚠️ No time slot available for match ${match.id}`);
        continue;
      }
      
      // Update the match with new time
      await updateSingleMatch(match.id, {
        ...match,
        scheduledTime: newTime
      });
      
      console.log(`✅ Updated match ${match.id} (${match.round}) to ${newTime}`);
    }
    
    console.log('🎉 All match times have been fixed!');
    return true;
  } catch (error) {
    console.error('❌ Error fixing match times:', error);
    return false;
  }
}

// Run this function to fix the times
if (typeof window !== 'undefined') {
  // Make it available in browser console for manual execution
  (window as any).fixMatchTimes = fixAllMatchTimes;
  console.log('💡 You can run fixMatchTimes() in the browser console to fix match times');
}
