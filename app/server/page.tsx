'use client';

import { useState } from 'react';
import Link from 'next/link';
import { chromaService } from '@/app/utils/chroma-service';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import ConfirmationDialog from '@/app/components/ConfirmationDialog';
import SettingsModal from '@/app/components/SettingsModal';

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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-8">
          {/* 顶部导航 */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <Link href="/collections" className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium mb-4">
                  ← Back to Collections
                </Link>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  Server Status
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Monitor and manage ChromaDB server
                </p>
              </div>
              <button
              onClick={openSettingsModal}
              className="inline-flex items-center px-4 py-2 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium text-sm shadow-lg hover:shadow-xl hover:shadow-purple-500/30"
            >
              ⚙️ Settings
            </button>
            </div>

            {/* 通知提示 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 animate-fade-in">
                <strong className="font-semibold">⚠️ Error: </strong>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 animate-fade-in">
                <strong className="font-semibold">✓ Success: </strong>
                <span>{success}</span>
              </div>
            )}
          </div>

          {/* 服务器状态卡片 */}
          <div className="grid gap-6">
            {/* 状态信息 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-linear-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Status Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-linear-to-br from-slate-50 to-white dark:from-slate-700/50 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">Heartbeat</div>
                    <code className="text-2xl font-semibold text-slate-900 dark:text-white font-mono break-all">
                      {serverStatus.heartbeat ? new Date(serverStatus.heartbeat).toLocaleString() : '—'}
                    </code>
                  </div>
                  <div className="bg-linear-to-br from-slate-50 to-white dark:from-slate-700/50 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">Version</div>
                    <code className="text-2xl font-semibold text-slate-900 dark:text-white font-mono break-all">
                      {serverStatus.version || '—'}
                    </code>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={checkServerStatus}
                    disabled={checkingStatus}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:from-violet-400 disabled:to-purple-400 shadow-lg hover:shadow-xl hover:shadow-purple-500/30"
                  >
                    {checkingStatus ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <span>🔍</span>
                        <span>Check Server Status</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 危险操作区 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-linear-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Danger Zone</h2>
              </div>
              <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">⚠️</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">Reset Database</h3>
                      <p className="text-red-800 dark:text-red-300 mb-4 leading-relaxed">
                        This action will permanently delete all collections and records in the database. This operation cannot be undone. Please make sure you have backed up any important data.
                      </p>
                      <button
                        onClick={resetDatabase}
                        disabled={resetting}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:bg-red-400 shadow-md hover:shadow-lg"
                      >
                        {resetting ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Resetting...</span>
                          </>
                        ) : (
                          <>
                            <span>🔄</span>
                            <span>Reset Database</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
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
        </div>
      </main>
    </div>
  );
}
