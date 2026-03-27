import { NextResponse } from 'next/server';

// Global WebSocket connection for server-side heartbeat
let ws: WebSocket | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;

// Initialize WebSocket connection
function initializeWebSocket() {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  if (!botToken) {
    console.error('❌ Missing DISCORD_BOT_TOKEN');
    return;
  }

  // Connect to Discord Gateway
  ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

  ws.onopen = () => {
    console.log('✅ Server-side Discord Gateway connected');
    
    // Send identify payload
    ws!.send(JSON.stringify({
      op: 2, // Identify
      d: {
        token: botToken,
        intents: 513, // GUILDS + GUILD_MESSAGES
        properties: {
          os: 'windows',
          browser: 'chrome',
          device: 'chrome'
        },
        presence: {
          status: 'online',
          activities: [{
            name: 'over 1 awesome tournament',
            type: 3, // 3 = Watching
            details: 'Managing BedWars Tournaments',
            state: 'Made by Sharmagaming',
            emoji: { name: '🏆' }
          }]
        }
      }
    }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.op === 10) { // Hello
      // Start heartbeat
      const heartbeatInterval = data.d.heartbeat_interval;
      startHeartbeat(heartbeatInterval);
      console.log('💓 Server-side heartbeat started with interval:', heartbeatInterval);
    }
    
    if (data.op === 0) { // Ready
      console.log('🤖 Server-side bot is ready and online!');
      console.log('📝 Bot username:', data.d.user.username);
      console.log('🟢 Bot status should now show as online with "Made by Sharmagaming"');
    }
    
    if (data.op === 11) { // Heartbeat ACK
      console.log('💓 Server-side heartbeat acknowledged');
    }
  };

  ws.onclose = () => {
    console.log('❌ Server-side WebSocket connection closed');
    scheduleReconnect();
  };

  ws.onerror = (error) => {
    console.error('❌ Server-side WebSocket error:', error);
    if (ws) {
      ws.close();
    }
  };
}

// Start heartbeat interval
function startHeartbeat(interval: number) {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  // Send first heartbeat immediately
  ws!.send(JSON.stringify({ op: 1, d: null }));

  // Then send heartbeats at the specified interval
  heartbeatInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ op: 1, d: null }));
      console.log('💓 Server-side heartbeat sent');
    }
  }, interval);
}

// Schedule reconnection
function scheduleReconnect() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }

  reconnectTimeout = setTimeout(() => {
    console.log('🔄 Server-side attempting to reconnect...');
    initializeWebSocket();
  }, 5000); // Reconnect after 5 seconds
}

// Initialize on first request
let isInitialized = false;

export async function POST() {
  try {
    if (!isInitialized) {
      console.log('🚀 Initializing server-side Discord bot heartbeat...');
      initializeWebSocket();
      isInitialized = true;
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Server-side heartbeat initialized',
      status: ws?.readyState === WebSocket.OPEN ? 'connected' : 'connecting',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Server-side heartbeat error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Server-side heartbeat endpoint active',
    connected: ws?.readyState === WebSocket.OPEN,
    timestamp: new Date().toISOString()
  });
}
