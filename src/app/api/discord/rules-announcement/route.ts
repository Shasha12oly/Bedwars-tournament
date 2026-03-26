import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, channelId, type } = await request.json();

    // Validate input
    if (!message || !channelId) {
      return NextResponse.json(
        { error: 'Missing message or channelId' },
        { status: 400 }
      );
    }

    // Format rules announcement for Discord
    const formattedMessage = type === 'rules_announcement' 
      ? `📋 **BEDWARS TOURNAMENT RULES**\n\n` +
        `🎮 **Ranked BedWars Rules Announcement**\n` +
        `┌─────────────────────────────────\n` +
        `│ 📢 **Rules Update**\n` +
        `│ 📝 **Message**: ${message}\n` +
        `│ 🔗 **Channel**: ${channelId}\n` +
        `│ ⏰ **Sent**: ${new Date().toLocaleString()}\n` +
        `└─────────────────────────────────\n\n` +
        `👉 **View Complete Rules**: /rules\n` +
        `🏆 **Register Team**: /tournaments/1/register\n` +
        `📊 **Tournament Status**: /tournaments/1`
      : message;

    // Send to Discord (you'll need to implement actual Discord bot integration)
    // For now, we'll simulate API call
    console.log('Sending Discord announcement:', {
      message: formattedMessage,
      channelId: '1486293985843482774',
      type: type || 'general',
      timestamp: new Date().toISOString()
    });

    // Mock successful response
    return NextResponse.json({
      success: true,
      message: 'Announcement sent successfully',
      data: {
        message: formattedMessage,
        channelId: '1486293985843482774',
        type: type || 'general',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Discord API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
