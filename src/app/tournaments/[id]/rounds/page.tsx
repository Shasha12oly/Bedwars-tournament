'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TournamentRounds() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main matches page which has the real tournament bracket
    router.replace('/matches');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white">
        <p>Redirecting to matches page...</p>
      </div>
    </div>
  );
}
