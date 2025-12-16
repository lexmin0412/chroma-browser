'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { chromaService } from '@/app/utils/chroma-service';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import ConfirmationDialog from '@/app/components/ConfirmationDialog';
import SettingsModal from '@/app/components/SettingsModal';
import ConfigManager from '@/app/utils/config-manager';

export default function ServerStatusPage() {
  // 服务器状态相关
  const [serverStatus, setServerStatus] = useState<{ heartbeat?: number; version?: string }>({});
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 设置相关状态
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 确认对话框状态
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 清空通知
  const clearNotifications = () => {
    setError(null);
    setSuccess(null);
  };

  // 打开设置模态框
  const openSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  // 保存设置后的回调
  const handleSettingsSaved = () => {
    // 显示成功消息
    setSuccess('Configuration saved successfully!');

    // 重新检查服务器状态以测试新配置
    setTimeout(() => {
      checkServerStatus();
    }, 1000);
  };

  // 检查服务器状态
  const checkServerStatus = async () => {
    try {
      setCheckingStatus(true);
      setError(null);
      clearNotifications();

      // 获取服务器状态
      const status = await chromaService.checkServerStatus();

      setServerStatus({ heartbeat: status.heartbeat, version: status.version });
      setSuccess('服务器状态检查成功');
    } catch (err) {
      const errorMessage = (err as Error).message;
      // 检查是否是连接错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。');
      } else {
        setError('服务器状态检查失败: ' + errorMessage);
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  // 重置数据库
  const resetDatabase = async () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = async () => {
    try {
      setResetting(true);
      setError(null);
      clearNotifications();

      await chromaService.resetDatabase();

      // 重置状态
      setServerStatus({});

      setSuccess('数据库重置成功');
    } catch (err) {
      const errorMessage = (err as Error).message;
      // 检查是否是连接错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。');
      } else {
        setError('数据库重置失败: ' + errorMessage);
      }
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 主内容区 */}
      <main className="flex-1 p-8 overflow-auto">
        {/* 顶部导航 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link href="/collections" className="text-blue-500 hover:text-blue-700 mr-4">
              ← 返回集合列表
            </Link>
            <button
              onClick={openSettingsModal}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm"
            >
              Settings
            </button>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Server Status
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor and manage server status
          </p>
        </div>

        {/* 通知提示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong className="font-bold">Error: </strong>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <strong className="font-bold">Success: </strong>
            <span>{success}</span>
          </div>
        )}

        {/* 服务器状态管理 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Server Status Management</h3>

          {/* 服务器状态信息 */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Current Server Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Heartbeat</div>
                <div className="text-lg font-semibold text-gray-800 dark:text-white">
                  {serverStatus.heartbeat ? new Date(serverStatus.heartbeat).toLocaleString() : 'Not checked'}
                </div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Version</div>
                <div className="text-lg font-semibold text-gray-800 dark:text-white">
                  {serverStatus.version || 'Unknown'}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={checkServerStatus}
                disabled={checkingStatus}
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {checkingStatus ? (
                  <>
                    <div className="mr-2">
                      <LoadingSpinner size="sm" />
                    </div>
                    Checking...
                  </>
                ) : (
                  'Check Server Status'
                )}
              </button>
            </div>
          </div>

          {/* 数据库重置 */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Database Reset</h4>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="text-red-800 dark:text-red-200 mb-2">
                ⚠️ Warning: This action will permanently delete all collections and records in the database.
              </div>
              <div className="text-red-700 dark:text-red-300 text-sm mb-4">
                This operation cannot be undone. Please make sure you have backed up any important data before proceeding.
              </div>
              <button
                onClick={resetDatabase}
                disabled={resetting}
                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {resetting ? (
                  <>
                    <div className="mr-2">
                      <LoadingSpinner size="sm" />
                    </div>
                    Resetting...
                  </>
                ) : (
                  'Reset Database'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 确认对话框 */}
        <ConfirmationDialog
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={handleResetConfirm}
          title="确认重置数据库"
          message="您确定要重置整个数据库吗？此操作将永久删除所有集合和记录，且无法撤销。"
          confirmText="确认重置"
          cancelText="取消"
        />

        {/* 设置模态框 */}
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={handleSettingsSaved}
        />
      </main>
    </div>
  );
}
