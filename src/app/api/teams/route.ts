import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const teamsFilePath = path.join(process.cwd(), 'data', 'teams.json');
    const teamsData = await fs.readFile(teamsFilePath, 'utf-8');
    const teams = JSON.parse(teamsData);
    
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error reading teams data:', error);
    return NextResponse.json(
      { error: 'Failed to load teams data' },
      { status: 500 }
    );
  }
}
