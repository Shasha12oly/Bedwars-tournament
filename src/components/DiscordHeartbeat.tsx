'use client';

import { useEffect, useRef } from 'react';

export default function DiscordHeartbeat() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Send heartbeat immediately when component mounts
    sendHeartbeat();

    // Set up periodic heartbeat every 5 minutes
    intervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup interval when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const sendHeartbeat = async () => {
    try {
      console.log('💓 Sending automatic heartbeat to Discord bot...');
      
      const response = await fetch('/api/discord/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Heartbeat sent successfully:', data.message);
      } else {
        console.error('❌ Failed to send heartbeat:', await response.text());
      }
    } catch (error) {
      console.error('❌ Heartbeat error:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
}
