import { NextRequest, NextResponse } from 'next/server';
import { getTeamsFromFile } from '@/lib/persistent-storage';

export async function GET(request: NextRequest) {
  try {
    const teams = await getTeamsFromFile();
    
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error reading teams data:', error);
    return NextResponse.json(
      { error: 'Failed to load teams data' },
      { status: 500 }
    );
  }
}
