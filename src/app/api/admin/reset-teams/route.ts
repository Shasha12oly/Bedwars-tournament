import { NextResponse } from 'next/server';
import { saveTeamsToFile } from '@/lib/file-storage';

export async function POST() {
  try {
    // Clear all teams by saving empty array
    const saved = await saveTeamsToFile([]);
    
    if (!saved) {
      return NextResponse.json({ error: 'Failed to reset teams' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All team registrations have been reset' 
    });

  } catch (error) {
    console.error('Error resetting teams:', error);
    return NextResponse.json({ error: 'Failed to reset teams' }, { status: 500 });
  }
}
