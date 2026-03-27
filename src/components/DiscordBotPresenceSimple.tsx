'use client';

import { useEffect, useRef } from 'react';

export default function DiscordBotPresence() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Send bot presence update immediately
    updateBotPresence();

    // Set up periodic updates every 5 minutes
    intervalRef.current = setInterval(() => {
      updateBotPresence();
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup interval when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const updateBotPresence = async () => {
    try {
      console.log('🤖 Updating Discord bot presence...');
      
      const response = await fetch('/api/discord/bot-presence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Bot presence updated:', data.message);
        console.log('🤖 Bot status:', data.botStatus);
      } else {
        console.error('❌ Failed to update bot presence:', await response.text());
      }
    } catch (error) {
      console.error('❌ Bot presence error:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
}
