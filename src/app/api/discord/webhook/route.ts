import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, username } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual Discord webhook integration
    // This would send messages to a Discord channel via webhook
    console.log('📨 Discord Webhook Request:', {
      content,
      username: username || 'Tournament Bot',
      timestamp: new Date().toISOString()
    });

    // For now, simulate success
    return NextResponse.json({
      success: true,
      message: 'Webhook message sent successfully (simulated)',
      content,
      username,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error sending Discord webhook:', error);
    return NextResponse.json(
      { error: 'Failed to send webhook message' },
      { status: 500 }
    );
  }
}
