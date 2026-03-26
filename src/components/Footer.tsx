'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-900/90 px-4 py-6 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span>·</span>
          <Link href="/tournaments" className="hover:text-slate-300 transition-colors">
            Tournaments
          </Link>
          <span>·</span>
          <Link href="/matches" className="hover:text-slate-300 transition-colors">
            Matches
          </Link>
        </div>
        <p className="text-xs text-slate-500">
          Developed by <span className="font-medium text-slate-400">Shashank sharma (sharmagaming)</span>
        </p>
      </div>
    </footer>
  );
}
