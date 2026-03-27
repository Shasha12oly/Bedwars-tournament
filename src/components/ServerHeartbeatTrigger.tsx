'use client';

import { useEffect } from 'react';

export default function ServerHeartbeatTrigger() {
  useEffect(() => {
    // Trigger server-side heartbeat when component mounts
    const startServerHeartbeat = async () => {
      try {
        console.log('🚀 Triggering server-side Discord bot heartbeat...');
        
        const response = await fetch('/api/discord/server-heartbeat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Server-side heartbeat triggered:', data.message);
          console.log('🤖 Bot status:', data.status);
        } else {
          console.error('❌ Failed to trigger server-side heartbeat:', await response.text());
        }
      } catch (error) {
        console.error('❌ Server-side heartbeat trigger error:', error);
      }
    };

    startServerHeartbeat();
  }, []);

  // This component doesn't render anything visible
  return null;
}
