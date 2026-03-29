import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Looking up Discord user:', {
      username,
      timestamp: new Date().toISOString()
    });

    // For now, return a simulated response
    // In the future, this could be implemented with a different approach
    return NextResponse.json({
      success: false,
      error: 'User lookup functionality temporarily disabled',
      username: username,
      note: 'The Discord user lookup system is being updated. Please use Discord user ID directly.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error looking up Discord user:', error);
    return NextResponse.json(
      { error: 'Failed to lookup user: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
