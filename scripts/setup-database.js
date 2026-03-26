const { Pool } = require('pg');

async function setupDatabase() {
  console.log('🔧 Setting up PostgreSQL database...');
  
  // First, try to connect to the default postgres database
  const defaultPool = new Pool({
    connectionString: 'postgresql://localhost:5432/postgres',
    ssl: false,
  });

  try {
    // Check if PostgreSQL is running
    await defaultPool.query('SELECT NOW()');
    console.log('✅ PostgreSQL is running');
    
    // Create the bedwars_tournament database if it doesn't exist
    try {
      await defaultPool.query('CREATE DATABASE bedwars_tournament');
      console.log('✅ Created bedwars_tournament database');
    } catch (error) {
      if (error.code === '42P04') {
        console.log('✅ Database already exists');
      } else {
        throw error;
      }
    }
    
    // Now connect to the bedwars_tournament database
    const tournamentPool = new Pool({
      connectionString: 'postgresql://localhost:5432/bedwars_tournament',
      ssl: false,
    });

    // Create the matches table
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

    await tournamentPool.query(createMatchesTable);
    console.log('✅ Matches table created/verified');

    // Insert sample matches
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const sampleMatches = [
      // Round of 16
      {
        id: 'r16-1',
        tournament_id: '1',
        round: 'Round of 16',
        player1: 'Team 1',
        player2: 'Team 2',
        status: 'upcoming',
        scheduled_time: '2:00 PM',
        scheduled_date: today,
        bracket_position: 1
      },
      {
        id: 'r16-2',
        tournament_id: '1',
        round: 'Round of 16',
        player1: 'Team 3',
        player2: 'Team 4',
        status: 'upcoming',
        scheduled_time: '2:15 PM',
        scheduled_date: today,
        bracket_position: 2
      },
      {
        id: 'r16-3',
        tournament_id: '1',
        round: 'Round of 16',
        player1: 'Team 5',
        player2: 'Team 6',
        status: 'upcoming',
        scheduled_time: '2:30 PM',
        scheduled_date: today,
        bracket_position: 3
      },
      {
        id: 'r16-4',
        tournament_id: '1',
        round: 'Round of 16',
        player1: 'Team 7',
        player2: 'Team 8',
        status: 'upcoming',
        scheduled_time: '2:45 PM',
        scheduled_date: today,
        bracket_position: 4
      },
      // Add more sample matches as needed...
    ];

    for (const match of sampleMatches) {
      try {
        await tournamentPool.query(`
          INSERT INTO matches (id, tournament_id, round, player1, player2, status, scheduled_time, scheduled_date, bracket_position)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [
          match.id, match.tournament_id, match.round, match.player1, match.player2,
          match.status, match.scheduled_time, match.scheduled_date, match.bracket_position
        ]);
      } catch (error) {
        console.log(`Match ${match.id} already exists`);
      }
    }

    console.log('✅ Sample matches inserted');
    console.log('🎉 Database setup complete!');
    
    await tournamentPool.end();
    await defaultPool.end();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n💡 Please make sure:');
    console.log('1. PostgreSQL is installed and running');
    console.log('2. You can connect to PostgreSQL with: psql -h localhost -U postgres');
    console.log('3. The postgres user has permission to create databases');
    process.exit(1);
  }
}

setupDatabase();
