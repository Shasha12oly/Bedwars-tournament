'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPanelRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified admin page
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-white">Redirecting to Admin Panel...</p>
      </div>
    </div>
  );
}
