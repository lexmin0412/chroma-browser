'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to collections page by default
    router.push('/collections');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)] mt-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center space-y-6">
        <div className="text-6xl">🗄️</div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Vector DB Browser</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Modern Vector Database Manager
          </p>
        </div>
        <div className="flex justify-center pt-4">
          <div className="w-8 h-8 border-4 border-violet-600 dark:border-violet-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-500 dark:text-slate-500 text-sm">
          Loading...
        </p>
      </div>
    </div>
  );
}
