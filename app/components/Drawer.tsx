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
          className="fixed inset-0 bg-black opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* 抽屉 */}
      <div
        className={`fixed inset-y-0 right-0 z-50 max-w-full w-full md:w-96 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl">
          {/* 头部 */}
          <div className="px-4 py-6 bg-gray-50 dark:bg-gray-700 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                onClick={onClose}
              >
                <span className="sr-only">关闭面板</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-6 sm:px-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
