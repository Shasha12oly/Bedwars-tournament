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

    console.log('🔍 Converting Discord username to ID:', username);

    // For now, return a simulated response
    // You can add actual Discord API integration later
    const knownUsers: Record<string, string> = {
      'shree_king': '1215171132265861133',
      'noicemaker.og': '123456789012345678', // Replace with actual ID
      // Add more known users as needed
    };

    const discordId = knownUsers[username.toLowerCase()];

    if (discordId) {
      console.log(`✅ Found Discord ID for ${username}: ${discordId}`);
      return NextResponse.json({
        success: true,
        username: username,
        discordId: discordId,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`❌ Discord ID not found for username: ${username}`);
      return NextResponse.json({
        success: false,
        error: 'Discord ID not found for this username',
        username: username,
        note: 'Add this user to the knownUsers mapping or implement Discord API lookup',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Error converting username to Discord ID:', error);
    return NextResponse.json(
      { error: 'Failed to convert username: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
