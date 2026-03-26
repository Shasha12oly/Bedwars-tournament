import { Pool } from 'pg';

let matchPool: Pool | null = null;

export interface Match {
  id: string;
  tournament_id: string;
  round: string;
  player1: string;
  player2: string;
  status: 'upcoming' | 'live' | 'completed';
  result?: string;
  scheduled_time: string;
  scheduled_date: string;
  bracket_position: number;
  created_at: string;
  updated_at: string;
}

export async function initializeMatchDatabase() {
  if (!matchPool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.warn('⚠️ DATABASE_URL environment variable not found');
      return false;
    }

    matchPool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000, // Increased timeout
    });

    // Test the connection
    try {
      await matchPool.query('SELECT NOW()');
      console.log('✅ Match database connected successfully');
    } catch (error: any) {
      console.error('❌ Failed to connect to match database:', error);
      
      // Try to create the database if it doesn't exist
      if (error.code === '3D000') { // database does not exist
        console.log('🔧 Database does not exist, attempting to create it...');
        try {
          // Connect to default postgres database to create our database
          const defaultPool = new Pool({
            connectionString: databaseUrl.replace(/\/[^\/]*$/, '/postgres'),
            ssl: false,
            max: 1,
            connectionTimeoutMillis: 5000,
          });
          
          await defaultPool.query('CREATE DATABASE bedwars_tournament');
          await defaultPool.end();
          console.log('✅ Database created successfully');
          
          // Try connecting again
          await matchPool.query('SELECT NOW()');
          console.log('✅ Match database connected successfully after creation');
        } catch (createError) {
          console.error('❌ Failed to create database:', createError);
          matchPool = null;
          return false;
        }
      } else {
        matchPool = null;
        return false;
      }
    }
  }
  
  if (!matchPool) return false;

  // Create matches table
  const createMatchesTable = `
    CREATE TABLE IF NOT EXISTS matches (
      id VARCHAR(50) PRIMARY KEY,
      tournament_id VARCHAR(50) NOT NULL,
      round VARCHAR(50) NOT NULL,
      player1 VARCHAR(100) NOT NULL,
      player2 VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'upcoming',
      result TEXT,
      scheduled_time VARCHAR(10) NOT NULL,
      scheduled_date VARCHAR(20) NOT NULL,
      bracket_position INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await matchPool.query(createMatchesTable);
    console.log('✅ Matches table initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating matches table:', error);
    return false;
  }
}

export async function createMatch(match: Omit<Match, 'id' | 'created_at' | 'updated_at'>): Promise<Match> {
  await initializeMatchDatabase();
  if (!matchPool) throw new Error('Database not initialized');

  const id = `${match.round.toLowerCase().replace(' ', '-')}-${match.bracket_position}`;
  const now = new Date().toISOString();

  const query = `
    INSERT INTO matches (id, tournament_id, round, player1, player2, status, result, scheduled_time, scheduled_date, bracket_position, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;

  const values = [
    id,
    match.tournament_id,
    match.round,
    match.player1,
    match.player2,
    match.status,
    match.result || null,
    match.scheduled_time,
    match.scheduled_date,
    match.bracket_position,
    now,
    now
  ];

  try {
    const result = await matchPool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creating match:', error);
    throw error;
  }
}

export async function getAllMatches(tournamentId: string): Promise<Match[]> {
  const dbInitialized = await initializeMatchDatabase();
  if (!dbInitialized || !matchPool) {
    console.log('❌ Database not initialized, returning empty array');
    return [];
  }

  const query = `
    SELECT * FROM matches 
    WHERE tournament_id = $1 
    ORDER BY bracket_position
  `;

  try {
    const result = await matchPool.query(query, [tournamentId]);
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting matches:', error);
    // Return empty array if database fails - will trigger sample data fallback
    return [];
  }
}

export async function updateMatchStatus(matchId: string, status: 'upcoming' | 'live' | 'completed', resultText?: string): Promise<Match | null> {
  const dbInitialized = await initializeMatchDatabase();
  if (!dbInitialized || !matchPool) {
    console.log('❌ Database not initialized, cannot update match status');
    return null;
  }

  const query = `
    UPDATE matches 
    SET status = $1, result = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;

  try {
    const queryResult = await matchPool.query(query, [status, resultText || null, matchId]);
    return queryResult.rows[0] || null;
  } catch (error) {
    console.error('❌ Error updating match status:', error);
    return null;
  }
}

export async function updateMatchPlayers(matchId: string, player1: string, player2: string): Promise<Match | null> {
  await initializeMatchDatabase();
  if (!matchPool) throw new Error('Database not initialized');

  const query = `
    UPDATE matches 
    SET player1 = $1, player2 = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;

  try {
    const result = await matchPool.query(query, [player1, player2, matchId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error updating match players:', error);
    throw error;
  }
}

export async function deleteAllMatches(tournamentId: string): Promise<void> {
  await initializeMatchDatabase();
  if (!matchPool) throw new Error('Database not initialized');

  const query = `DELETE FROM matches WHERE tournament_id = $1`;

  try {
    await matchPool.query(query, [tournamentId]);
    console.log('✅ All matches deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting matches:', error);
    throw error;
  }
}

export async function generateTournamentBracket(tournamentId: string): Promise<Match[]> {
  await initializeMatchDatabase();
  if (!matchPool) throw new Error('Database not initialized');

  // First, delete existing matches
  await deleteAllMatches(tournamentId);

  const today = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const bracketData = [
    // Round of 16 - 8 matches
    { round: 'Round of 16', player1: 'Team 1', player2: 'Team 2', time: '2:00 PM', position: 1 },
    { round: 'Round of 16', player1: 'Team 3', player2: 'Team 4', time: '2:15 PM', position: 2 },
    { round: 'Round of 16', player1: 'Team 5', player2: 'Team 6', time: '2:30 PM', position: 3 },
    { round: 'Round of 16', player1: 'Team 7', player2: 'Team 8', time: '2:45 PM', position: 4 },
    { round: 'Round of 16', player1: 'Team 9', player2: 'Team 10', time: '3:00 PM', position: 5 },
    { round: 'Round of 16', player1: 'Team 11', player2: 'Team 12', time: '3:15 PM', position: 6 },
    { round: 'Round of 16', player1: 'Team 13', player2: 'Team 14', time: '3:30 PM', position: 7 },
    { round: 'Round of 16', player1: 'Team 15', player2: 'Team 16', time: '3:45 PM', position: 8 },
    // Quarterfinals - 4 matches
    { round: 'Quarterfinals', player1: 'Winner of Match 1', player2: 'Winner of Match 2', time: '4:15 PM', position: 9 },
    { round: 'Quarterfinals', player1: 'Winner of Match 3', player2: 'Winner of Match 4', time: '4:30 PM', position: 10 },
    { round: 'Quarterfinals', player1: 'Winner of Match 5', player2: 'Winner of Match 6', time: '4:45 PM', position: 11 },
    { round: 'Quarterfinals', player1: 'Winner of Match 7', player2: 'Winner of Match 8', time: '5:00 PM', position: 12 },
    // Semifinals - 2 matches
    { round: 'Semifinals', player1: 'Winner of QF 1', player2: 'Winner of QF 2', time: '6:30 PM', position: 13 },
    { round: 'Semifinals', player1: 'Winner of QF 3', player2: 'Winner of QF 4', time: '7:00 PM', position: 14 },
    // Final - 1 match
    { round: 'Final', player1: 'Winner of SF 1', player2: 'Winner of SF 2', time: '8:30 PM', position: 15 }
  ];

  const matches: Match[] = [];

  for (const matchData of bracketData) {
    const match = await createMatch({
      tournament_id: tournamentId,
      round: matchData.round,
      player1: matchData.player1,
      player2: matchData.player2,
      status: 'upcoming',
      result: undefined,
      scheduled_time: matchData.time,
      scheduled_date: today,
      bracket_position: matchData.position
    });
    matches.push(match);
  }

  console.log(`✅ Generated ${matches.length} matches for tournament`);
  return matches;
}
