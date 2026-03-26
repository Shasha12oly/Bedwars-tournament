import { NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Data storage directory
const DATA_DIR = join(process.cwd(), 'data');
const TEAMS_FILE = join(DATA_DIR, 'teams.json');
const TOURNAMENTS_FILE = join(DATA_DIR, 'tournaments.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Read teams from JSON file
export async function getTeamsFromFile() {
  await ensureDataDir();
  try {
    const data = await readFile(TEAMS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is empty, return empty array
    return [];
  }
}

// Save teams to JSON file
export async function saveTeamsToFile(teams: any[]) {
  await ensureDataDir();
  try {
    await writeFile(TEAMS_FILE, JSON.stringify(teams, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving teams to file:', error);
    return false;
  }
}

// Read tournaments from JSON file
export async function getTournamentsFromFile() {
  await ensureDataDir();
  try {
    const data = await readFile(TOURNAMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return default tournament if file doesn't exist
    return [
      {
        id: '1',
        name: 'Blood Rush BedWars',
        date: 'March 29, 2026',
        time: '2:00 PM - 9:00 PM',
        status: 'upcoming',
        format: 'rbw 4v4',
        maxSlots: 16,
        currentTeams: 0,
        prizePool: '₹2000',
        rules: [
          'No cheating, hacking, or exploiting bugs',
          'Respect all players and staff',
          'Be on time for matches',
          'Follow Discord server rules',
          'Admin decisions are final'
        ],
        schedule: [
          { time: '2:00 PM', event: 'Registration closes' },
          { time: '2:15 PM', event: 'Tournament begins' },
          { time: '2:30 PM', event: 'Round of 16 starts' },
          { time: '4:15 PM', event: 'Quarterfinals' },
          { time: '6:30 PM', event: 'Semifinals' },
          { time: '8:30 PM', event: 'Finals' },
          { time: '9:00 PM', event: 'Awards ceremony' }
        ]
      }
    ];
  }
}

// Save tournaments to JSON file
export async function saveTournamentsToFile(tournaments: any[]) {
  await ensureDataDir();
  try {
    await writeFile(TOURNAMENTS_FILE, JSON.stringify(tournaments, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving tournaments to file:', error);
    return false;
  }
}

// Get team count for a tournament
export async function getTeamCountFromFile(tournamentId: string) {
  const teams = await getTeamsFromFile();
  return teams.filter((team: any) => team.tournamentId === tournamentId).length;
}
