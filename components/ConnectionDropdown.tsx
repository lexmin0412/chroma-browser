'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { IConnectionItem } from '@/types';
import ConnectionManagementDrawer from './ConnectionManagementDrawer';

interface ConnectionDropdownProps {
  connections: IConnectionItem[];
  isLoading: boolean;
}

export default function ConnectionDropdown({ connections, isLoading }: ConnectionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
	const {connectionId} = useParams<{connectionId: string}>()
  const currentConnection = connections.find(conn => conn.id.toString() === connectionId);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleConnectionClick = (connection: IConnectionItem) => {
    // 如果点击的连接和当前连接相同，不做路由跳转
    if (connection.id.toString() === connectionId) {
      setIsOpen(false);
      return;
    }

    // 跳转到 collections 页面并携带 connectionId
    router.push(`/${connection.id}/collections`);
    setIsOpen(false);
  };

  const handleConnectionSelect = (connection: IConnectionItem) => {
    console.log('切换到连接:', connection.name);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
      >
        <span>{currentConnection ? currentConnection.name : '连接'}</span>
        <Icon
          icon="heroicons:chevron-down"
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">连接列表</h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsManagerOpen(true);
              }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <Icon
                icon="heroicons:cog-6-tooth"
                className="w-4 h-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              />
            </button>
          </div>

          {/* 连接列表 */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Icon icon="heroicons:arrow-path" className="w-4 h-4 animate-spin" />
                  加载中...
                </div>
              </div>
            ) : connections.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  暂无连接
                </p>
                <Link
                  href="/connections"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon icon="heroicons:plus" className="w-4 h-4" />
                  创建连接
                </Link>
              </div>
            ) : (
              <div className="py-1">
                {connections.map((connection) => (
                  <button
                    key={connection.id}
                    onClick={() => handleConnectionClick(connection)}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        icon={
                          connection.type === 'ChromaCloud'
                            ? 'heroicons:cloud'
                            : 'heroicons:server'
                        }
                        className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                      />
                      <div>
                        <div className="font-medium">{connection.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {connection.type === 'ChromaCloud' ? 'Chroma Cloud' : 'Chroma Normal'}
                        </div>
                      </div>
                    </div>
                    <Icon
                      icon="heroicons:check"
                      className="w-4 h-4 text-transparent group-hover:text-slate-400 dark:group-hover:text-slate-500"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connections Manager Modal */}
      <ConnectionManagementDrawer
        open={isManagerOpen}
        onOpenChange={setIsManagerOpen}
        onConnectionSelect={handleConnectionSelect}
      />
    </div>
  );
}
