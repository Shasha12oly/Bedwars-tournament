'use client';

import { useEffect, useRef } from 'react';

export default function DiscordBotPresence() {
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectToDiscord();

    return () => {
      cleanup();
    };
  }, []);

  const connectToDiscord = async () => {
    try {
      console.log('🔌 Connecting to Discord Gateway...');

      // Get gateway URL
      const gatewayRes = await fetch('/api/discord/gateway');
      const gatewayData = await gatewayRes.json();
      
      if (!gatewayData.ok) {
        console.error('❌ Failed to get gateway URL:', gatewayData.error);
        return;
      }

      // Connect to WebSocket
      const ws = new WebSocket(gatewayData.url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Connected to Discord Gateway');
        
        // Send identify payload
        ws.send(JSON.stringify({
          op: 2, // Identify
          d: {
            token: process.env.NEXT_PUBLIC_DISCORD_BOT_TOKEN,
            intents: 513, // GUILDS + GUILD_MESSAGES
            properties: {
              os: 'windows',
              browser: 'chrome',
              device: 'chrome'
            },
            presence: {
              status: 'online',
              activities: [{
                name: '🏆 BedWars Tournament Management',
                type: 0, // Playing
                details: 'Managing tournaments & matches',
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
          startHeartbeat(ws, heartbeatInterval);
          console.log('💓 Started heartbeat with interval:', heartbeatInterval);
        }
        
        if (data.op === 0) { // Ready
          console.log('🤖 Bot is ready and online!');
          console.log('📝 Bot username:', data.d.user.username);
          console.log('🟢 Bot status should now show as online');
        }
        
        if (data.op === 11) { // Heartbeat ACK
          console.log('💓 Heartbeat acknowledged');
        }
      };

      ws.onclose = () => {
        console.log('❌ WebSocket connection closed');
        scheduleReconnect();
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        ws.close();
      };

    } catch (error) {
      console.error('❌ Error connecting to Discord:', error);
      scheduleReconnect();
    }
  };

  const startHeartbeat = (ws: WebSocket, interval: number) => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    // Send first heartbeat immediately
    ws.send(JSON.stringify({ op: 1, d: null }));

    // Then send heartbeats at the specified interval
    heartbeatIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ op: 1, d: null }));
        console.log('💓 Heartbeat sent');
      }
    }, interval);
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Attempting to reconnect...');
      connectToDiscord();
    }, 5000); // Reconnect after 5 seconds
  };

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  // This component doesn't render anything visible
  return null;
}
