import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import "./globals.css";
import ConnectionDropdownWrapper from '../app/ConnectionDropdownWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vector DB Browser",
  description: "A modern web-based management interface for vector databases",
  icons: {
    icon: "/vector-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950`}
      >
        <div className="flex flex-col h-screen overflow-hidden">
          {/* Top Navigation Bar */}
          <header className="relative z-20 h-16 flex items-center bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-full px-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image
                  src="/vector-icon.svg"
                  alt="Vector Icon"
                  width={24}
                  height={24}
                  className="text-violet-600"
                />
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Vector DB Browser</h1>
              </div>
              <nav className="flex gap-4 items-center">
                <ConnectionDropdownWrapper />
                <Link
									target="_blank"
                  href="https://github.com/lexmin0412/chroma-browser"
                  className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                  aria-label="Github Repository"
                >
                  <Icon icon="mdi:github" className="w-5 h-5" />
                </Link>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
