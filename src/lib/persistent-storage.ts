import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Read teams with fallback
export async function getTeamsFromFile() {
  await ensureDataDir();
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'teams.json'), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Teams file not found, creating empty array');
    // If file doesn't exist, create it with empty array
    await fs.writeFile(path.join(DATA_DIR, 'teams.json'), JSON.stringify([]), 'utf-8');
    return [];
  }
}

// Save teams with error handling
export async function saveTeamsToFile(teams: any[]) {
  await ensureDataDir();
  try {
    await fs.writeFile(path.join(DATA_DIR, 'teams.json'), JSON.stringify(teams, null, 2), 'utf-8');
    console.log(`✅ Saved ${teams.length} teams to file`);
    return true;
  } catch (error) {
    console.error('❌ Failed to save teams:', error);
    return false;
  }
}

// Read tournaments with fallback
export async function getTournamentsFromFile() {
  await ensureDataDir();
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'tournaments.json'), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Tournaments file not found, creating empty array');
    // If file doesn't exist, create it with empty array
    await fs.writeFile(path.join(DATA_DIR, 'tournaments.json'), JSON.stringify([]), 'utf-8');
    return [];
  }
}

// Get team count for specific tournament
export async function getTeamCountFromFile(tournamentId: string) {
  const teams = await getTeamsFromFile();
  return teams.filter((team: any) => team.tournamentId === tournamentId).length;
}
