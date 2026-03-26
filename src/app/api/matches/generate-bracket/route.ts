import { NextResponse } from 'next/server';
import { generateTournamentBracket } from '@/lib/match-database';

export async function POST(request: Request) {
  try {
    const { tournamentId } = await request.json();

    // Generate new bracket (this automatically clears existing matches)
    const matches = await generateTournamentBracket(tournamentId || '1');

    return NextResponse.json({
      message: 'Tournament bracket created successfully',
      matches: matches,
      totalMatches: matches.length
    });

  } catch (error) {
    console.error('Error creating tournament bracket:', error);
    return NextResponse.json({ error: 'Failed to create tournament bracket' }, { status: 500 });
  }
}
