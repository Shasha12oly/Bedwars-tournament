import { NextResponse } from 'next/server';
import { getStorageStatus } from '@/lib/hybrid-storage';

// API endpoint to check storage system status
export async function GET() {
  try {
    const status = await getStorageStatus();
    
    return NextResponse.json({
      success: true,
      storage: status,
      message: `Active storage: ${status.active.toUpperCase()}`,
      details: {
        discord: status.discord ? 'Connected' : 'Disconnected',
        localStorage: status.localStorage ? 'Available' : 'Unavailable'
      }
    });
  } catch (error) {
    console.error('Storage status check failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to check storage status'
    }, { status: 500 });
  }
}
