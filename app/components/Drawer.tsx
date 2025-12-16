'use client';

import React from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  return (
    <>
      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* 抽屉 */}
      <div
        className={`fixed inset-y-0 right-0 z-50 max-w-full w-full md:w-96 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col bg-white dark:bg-slate-800 shadow-2xl">
          {/* 头部 */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {title}
              </h2>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                onClick={onClose}
              >
                <span className="sr-only">Close panel</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
