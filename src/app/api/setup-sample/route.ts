import { NextResponse } from 'next/server';
import { 
  getTournamentsFromDatabase,
  saveTeamToDatabase,
  getTeamsFromDatabase,
  saveMatchToDatabase,
  updateTournamentStatus
} from '@/lib/tournament-storage';

export async function POST() {
  try {
    // Check if tournaments already exist
    const tournaments = await getTournamentsFromDatabase();
    
    if (tournaments.length > 0) {
      return NextResponse.json({ 
        message: 'Tournaments already exist',
        tournaments: tournaments 
      });
    }

    // Create Blood Rush BedWars tournament
    const bloodRushTournament = {
      id: '1',
      name: 'Blood Rush BedWars',
      date: 'March 29, 2026',
      time: '2:00 PM - 9:00 PM',
      status: 'upcoming',
      format: 'Rankedbedwars 4v4',
      max_slots: 16,
      prize_pool: '🏆 Hero Rank in MCFleet (reward receiver)\n💎 Special Rank in Hellcore (all team members)\n⭐ Special Discord Role (all team members)',
      rules: [
        "No cheating, hacking, or exploiting bugs",
        "Respect all players and staff",
        "Be on time for matches",
        "Follow Discord server rules",
        "Admin decisions are final"
      ],
      schedule: [
        { "time": "2:00 PM", "event": "Registration closes" },
        { "time": "2:15 PM", "event": "Tournament begins" },
        { "time": "2:30 PM", "event": "Round of 16 starts" },
        { "time": "4:15 PM", "event": "Quarterfinals" },
        { "time": "6:30 PM", "event": "Semifinals" },
        { "time": "8:30 PM", "event": "Finals" },
        { "time": "9:00 PM", "event": "Awards ceremony" }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert tournament directly into database
    const pool = await (await import('@/lib/tournament-storage')).initializeDatabase();
    if (!pool) {
      throw new Error('Database not initialized');
    }

    await pool.query(`
      INSERT INTO tournaments (
        id, name, date, time, status, format, max_slots, prize_pool, 
        rules, schedule, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      bloodRushTournament.id,
      bloodRushTournament.name,
      bloodRushTournament.date,
      bloodRushTournament.time,
      bloodRushTournament.status,
      bloodRushTournament.format,
      bloodRushTournament.max_slots,
      bloodRushTournament.prize_pool,
      JSON.stringify(bloodRushTournament.rules),
      JSON.stringify(bloodRushTournament.schedule),
      bloodRushTournament.created_at,
      bloodRushTournament.updated_at
    ]);

    return NextResponse.json({ 
      message: 'Blood Rush BedWars tournament created successfully!',
      tournament: bloodRushTournament 
    });

  } catch (error) {
    console.error('Error setting up sample tournament:', error);
    return NextResponse.json({ 
      error: 'Failed to setup sample tournament',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
