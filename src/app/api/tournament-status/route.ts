import { NextRequest, NextResponse } from 'next/server';
import { getTournaments } from '@/lib/firebase-database';

export async function GET(request: NextRequest) {
  try {
    const tournaments = await getTournaments();
    
    if (tournaments.length === 0) {
      return NextResponse.json({ 
        error: 'No tournaments found',
        status: 'none'
      }, { status: 404 });
    }

    const tournament = tournaments[0];
    
    return NextResponse.json({
      tournamentId: tournament.id,
      status: tournament.status,
      manualStatusOverride: tournament.manualStatusOverride,
      forceStatus: tournament.forceStatus,
      adminOverrideActive: tournament.adminOverrideActive,
      overrideTimestamp: tournament.overrideTimestamp,
      overrideReason: tournament.overrideReason,
      totalTeams: tournament.totalTeams,
      maxSlots: tournament.maxSlots,
      message: tournament.adminOverrideActive 
        ? '⚠️ Admin override is active - automatic logic is disabled'
        : '✅ Automatic status calculation is active'
    });

  } catch (error) {
    console.error('Error fetching tournament status:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch tournament status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
