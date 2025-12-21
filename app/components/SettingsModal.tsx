'use client';

import React, { useState, useEffect } from 'react';
import ConfigManager from '../utils/config-manager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 加载现有配置
  useEffect(() => {
    if (isOpen) {
      const config = ConfigManager.getInstance().getConfig();
      setHost(config.host || '');
      setPort(config.port ? config.port.toString() : '');
    }
  }, [isOpen]);

  const handleSave = () => {
    // 验证输入
    if (!host.trim()) {
      setError('Host is required');
      return;
    }

    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum <= 0 || portNum > 65535) {
      setError('Port must be a valid number between 1 and 65535');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // 保存配置
      ConfigManager.getInstance().updateConfig(host.trim(), portNum);

      // 触发保存回调
      onSave();

      // 关闭模态框
      onClose();
    } catch (err) {
      setError('Failed to save configuration: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // 重置表单状态
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 模态框 */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl transform transition-all w-full max-w-md animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Chroma DB Settings
            </h3>
          </div>

          {/* 内容 */}
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Host *
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="e.g., localhost, 192.168.1.100"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Port *
              </label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="e.g., 3003"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                disabled={saving}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="text-sm text-slate-500 dark:text-slate-400">
              <p>Your Chroma DB must be accessible at the specified host and port.</p>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:from-indigo-400 disabled:to-blue-400 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 disabled:shadow-none flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
