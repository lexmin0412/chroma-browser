'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to collections page by default
    router.push('/collections');
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Chroma DB Manager</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Redirecting to collections page...
        </p>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
