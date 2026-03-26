import { NextResponse } from 'next/server';
import { getTeamCountFromFile } from '@/lib/file-storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    if (!tournamentId) {
      return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 });
    }

    const teamCount = await getTeamCountFromFile(tournamentId);

    return NextResponse.json({ 
      tournamentId,
      teamCount,
      message: `Team count retrieved successfully` 
    });

  } catch (error) {
    console.error('Error getting team count:', error);
    return NextResponse.json({ error: 'Failed to get team count' }, { status: 500 });
  }
}
