import { Pool } from 'pg';

type DbStatus = 'upcoming' | 'open' | 'in_progress' | 'completed' | 'closed';
type TeamStatus = 'registered' | 'eliminated' | 'winner';
type MatchStatus = 'scheduled' | 'in_progress' | 'completed';

export let pool: Pool | null = null;

// Initialize database connection
export async function initializeDatabase() {
  try {
    if (!pool) {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable not found');
      }

      pool = new Pool({
        connectionString: databaseUrl,
        max: 10,
        ssl: {
          rejectUnauthorized: false
        },
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      });

      // Test connection with retry logic
      let retries = 3;
      let connected = false;
      
      while (retries > 0 && !connected) {
        try {
          await pool.query('SELECT 1');
          connected = true;
          console.log('✅ Postgres database connected successfully');
        } catch (err) {
          retries--;
          console.log(`⚠️ Connection attempt failed, retries left: ${retries}`);
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw err;
          }
        }
      }

      // Create tables if they don't exist
      await createTables();
    }
    return pool;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Create comprehensive database tables
async function createTables() {
  if (!pool) throw new Error('Database not initialized');

  // Tournaments table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming',
      format TEXT NOT NULL,
      max_slots INT NOT NULL,
      prize_pool TEXT NOT NULL,
      rules JSONB NOT NULL,
      schedule JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'tournaments_set_updated_at'
      ) THEN
        CREATE TRIGGER tournaments_set_updated_at
        BEFORE UPDATE ON tournaments
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
      END IF;
    END $$;
  `);

  // Teams table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      captain TEXT NOT NULL,
      members JSONB NOT NULL,
      discord_users JSONB NOT NULL,
      reward_receiver TEXT NOT NULL,
      registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'registered',
      final_position INT NULL
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS teams_tournament_id_idx ON teams(tournament_id);
  `);

  // Matches table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
      round TEXT NOT NULL,
      team1_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      team2_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      winner_id TEXT NULL REFERENCES teams(id) ON DELETE CASCADE,
      match_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS matches_tournament_id_idx ON matches(tournament_id);
  `);

  // Tournament winners table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tournament_winners (
      id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      position INT NOT NULL,
      prize_won TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tournament_id, position)
    );
  `);

  console.log('✅ Database tables created/verified (Postgres)');
}

// Get all tournaments
export async function getTournamentsFromDatabase() {
  await initializeDatabase();
  if (!pool) throw new Error('Database not initialized');

  try {
    const res = await pool.query('SELECT * FROM tournaments ORDER BY created_at DESC');
    console.log(`✅ Loaded ${res.rowCount ?? res.rows.length} tournaments from database`);
    return res.rows;
  } catch (error) {
    console.error('❌ Failed to get tournaments:', error);
    return [];
  }
}

// Get teams for specific tournament
export async function getTeamsFromDatabase(tournamentId?: string) {
  await initializeDatabase();
  if (!pool) throw new Error('Database not initialized');

  try {
    let query = 'SELECT * FROM teams';
    let params: any[] = [];
    
    if (tournamentId) {
      query += ' WHERE tournament_id = $1';
      params = [tournamentId];
    }
    
    query += ' ORDER BY registered_at DESC';
    
    const res = await pool.query(query, params);
    console.log(`✅ Loaded ${res.rowCount ?? res.rows.length} teams from database`);
    return res.rows;
  } catch (error) {
    console.error('❌ Failed to get teams:', error);
    return [];
  }
}

// Save team to database
export async function saveTeamToDatabase(team: any) {
  await initializeDatabase();
  if (!pool) throw new Error('Database not initialized');

  try {
    await pool.query(`
      INSERT INTO teams (
        id, tournament_id, name, captain, members, discord_users, 
        reward_receiver, registered_at, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      team.id,
      team.tournamentId,
      team.name,
      team.captain,
      JSON.stringify(team.members),
      JSON.stringify(team.discordUsers),
      team.rewardReceiver,
      team.registeredAt || new Date().toISOString(),
      team.status || 'registered'
    ]);

    console.log(`✅ Saved team "${team.name}" to database`);
    return true;
  } catch (error) {
    console.error('❌ Failed to save team:', error);
    return false;
  }
}

// Update tournament status
export async function updateTournamentStatus(tournamentId: string, status: string) {
  await initializeDatabase();
  if (!pool) throw new Error('Database not initialized');

  try {
    await pool.query(
      'UPDATE tournaments SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, tournamentId]
    );
    console.log(`✅ Updated tournament ${tournamentId} status to ${status}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to update tournament status:', error);
    return false;
  }
}

// Get matches for tournament
export async function getMatchesFromDatabase(tournamentId: string) {
  await initializeDatabase();
  if (!pool) throw new Error('Database not initialized');

  try {
    const res = await pool.query(`
      SELECT m.*, t1.name as team1_name, t2.name as team2_name, t.name as winner_name
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN teams t ON m.winner_id = t.id
      WHERE m.tournament_id = $1
      ORDER BY m.round, m.id
    `, [tournamentId]);

    return res.rows;
  } catch (error) {
    console.error('❌ Failed to get matches:', error);
    return [];
  }
}

// Clear all matches for a tournament
export async function clearMatchesFromDatabase(tournamentId: string) {
  await initializeDatabase();
  if (!pool) throw new Error('Database not initialized');

  try {
    await pool.query('DELETE FROM matches WHERE tournament_id = $1', [tournamentId]);
    console.log(`✅ Cleared all matches for tournament ${tournamentId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to clear matches:', error);
    return false;
  }
}

// Save match to database
export async function saveMatchToDatabase(match: any) {
  await initializeDatabase();
  if (!pool) throw new Error('Database not initialized');

  try {
    // For TBD matches, use unique placeholder team IDs to satisfy NOT NULL constraint
    const team1Id = match.team1Id || (match.team1Name === 'TBD' ? `tbd_${match.id}_1` : null);
    const team2Id = match.team2Id || (match.team2Name === 'TBD' ? `tbd_${match.id}_2` : null);
    
    await pool.query(`
      INSERT INTO matches (
        id, tournament_id, round, team1_id, team2_id, winner_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      match.id,
      match.tournamentId,
      match.round,
      team1Id,
      team2Id,
      match.winnerId || null,
      match.status || 'scheduled'
    ]);

    console.log(`✅ Saved match ${match.id} to database`);
    return true;
  } catch (error) {
    console.error('❌ Failed to save match:', error);
    return false;
  }
}

// Update match result
export async function updateMatchResult(matchId: string, winnerId: string) {
  await initializeDatabase();
  if (!pool) throw new Error('Database not initialized');

  try {
    await pool.query(
      'UPDATE matches SET winner_id = $1, status = $2 WHERE id = $3',
      [winnerId, 'completed', matchId]
    );
    console.log(`✅ Updated match ${matchId} winner to ${winnerId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to update match result:', error);
    return false;
  }
}


// Save tournament winner
export async function saveTournamentWinner(winner: any) {
  await initializeDatabase();
  if (!pool) throw new Error('Database not initialized');

  try {
    await pool.query(`
      INSERT INTO tournament_winners (
        id, tournament_id, team_id, position, prize_won, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      winner.id,
      winner.tournamentId,
      winner.teamId,
      winner.position,
      winner.prizeWon,
      winner.createdAt
    ]);

    console.log(`✅ Saved tournament winner: ${winner.teamId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to save tournament winner:', error);
    return false;
  }
}

// Get tournament winners
export async function getTournamentWinners(tournamentId: string) {
  await initializeDatabase();
  if (!pool) throw new Error('Database not initialized');

  try {
    const res = await pool.query(`
      SELECT tw.*, t.name as team_name, t.captain
      FROM tournament_winners tw
      JOIN teams t ON tw.team_id = t.id
      WHERE tw.tournament_id = $1
      ORDER BY tw.position ASC
    `, [tournamentId]);

    return res.rows;
  } catch (error) {
    console.error('❌ Failed to get tournament winners:', error);
    return [];
  }
}

// Get team count for specific tournament
export async function getTeamCountFromDatabase(tournamentId: string) {
  await initializeDatabase();
  if (!pool) throw new Error('Database not initialized');

  try {
    const res = await pool.query(
      'SELECT COUNT(*) as count FROM teams WHERE tournament_id = $1',
      [tournamentId]
    );
    const count = parseInt(res.rows[0].count);
    console.log(`📊 Team count for tournament ${tournamentId}: ${count}`);
    return count;
  } catch (error) {
    console.error('❌ Failed to get team count:', error);
    return 0;
  }
}

// Delete team from database
export async function deleteTeamFromDatabase(teamId: string) {
  await initializeDatabase();
  if (!pool) throw new Error('Database not initialized');

  try {
    const res = await pool.query(
      'DELETE FROM teams WHERE id = $1',
      [teamId]
    );
    const deleted = (res.rowCount ?? 0) > 0;
    console.log(`${deleted ? '✅' : '❌'} Team ${teamId} ${deleted ? 'deleted' : 'not found'}`);
    return deleted;
  } catch (error) {
    console.error('❌ Failed to delete team:', error);
    return false;
  }
}

// Delete all teams from database
export async function deleteAllTeams() {
  await initializeDatabase();
  if (!pool) throw new Error('Database not initialized');

  try {
    const res = await pool.query('DELETE FROM teams');
    const deleted = res.rowCount ?? 0;
    console.log(`✅ Deleted ${deleted} teams from database`);
    return deleted;
  } catch (error) {
    console.error('❌ Failed to delete all teams:', error);
    throw error;
  }
}
