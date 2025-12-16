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
        className="fixed inset-0 bg-black opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* 模态框 */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Chroma DB Settings
            </h3>
          </div>

          {/* 内容 */}
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Host *
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="e.g., localhost, 192.168.1.100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Port *
              </label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="e.g., 3003"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={saving}
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Your Chroma DB must be accessible at the specified host and port.</p>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
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
