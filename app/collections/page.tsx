'use client';

import React, { useState, useEffect } from 'react';
import { chromaService } from '../utils/chroma-service';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationDialog from '../components/ConfirmationDialog';
import Drawer from '../components/Drawer';
import SettingsModal from '../components/SettingsModal';
import ConfigManager from '../utils/config-manager';
import type { Collection } from 'chromadb';
import Link from 'next/link';

export default function CollectionsPage() {
  // 状态管理
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 创建集合相关状态
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionMetadata, setNewCollectionMetadata] = useState(''); // JSON string

  // 设置相关状态
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 确认对话框状态
  const [showDeleteCollectionConfirm, setShowDeleteCollectionConfirm] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);

  // 清空通知
  const clearNotifications = () => {
    setError(null);
    setSuccess(null);
  };

  // 获取集合列表
  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await chromaService.listCollections();
      setCollections(result);
    } catch (err) {
      const errorMessage = (err as Error).message;
      // 检查是否是连接错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。');
      } else {
        setError('获取集合失败: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // 打开设置模态框
  const openSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  // 保存设置后的回调
  const handleSettingsSaved = () => {
    // 显示成功消息
    setSuccess('Configuration saved successfully!');

    // 重新加载集合列表以测试新配置
    setTimeout(() => {
      fetchCollections();
    }, 1000);
  };

  // 打开创建集合抽屉
  const openCreateDrawer = () => {
    setIsCreateDrawerOpen(true);
  };

  // 关闭创建集合抽屉
  const closeCreateDrawer = () => {
    setIsCreateDrawerOpen(false);
    // 重置表单
    setNewCollectionName('');
    setNewCollectionMetadata('');
    setError(null);
  };

  // 创建集合
  const createCollection = async () => {
    if (!newCollectionName.trim()) {
      setError('集合名称是必需的');
      return;
    }

    // 验证集合名称格式
    if (!/^[a-zA-Z0-9\-_]+$/.test(newCollectionName)) {
      setError('集合名称只能包含字母、数字、连字符(-)和下划线(_)');
      return;
    }

    try {
      setCreatingCollection(true);
      setError(null);

      let metadata = undefined;
      if (newCollectionMetadata.trim()) {
        try {
          metadata = JSON.parse(newCollectionMetadata);
          // 验证元数据是否为对象
          if (typeof metadata !== 'object' || Array.isArray(metadata) || metadata === null) {
            setError('元数据必须是一个有效的 JSON 对象');
            return;
          }
        } catch (err) {
          setError('元数据 JSON 格式无效: ' + (err as Error).message);
          return;
        }
      }

      await chromaService.createCollection(newCollectionName, metadata);

      // 关闭抽屉并重置表单
      closeCreateDrawer();

      // 更新集合列表
      await fetchCollections();

      setSuccess('集合创建成功');
    } catch (err) {
      const errorMessage = (err as Error).message;
      // 检查是否是连接错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。');
      } else if (errorMessage.includes('already exists')) {
        setError('集合已存在，请使用不同的名称');
      } else {
        setError('集合创建失败: ' + errorMessage);
      }
    } finally {
      setCreatingCollection(false);
    }
  };

  // 删除集合
  const deleteCollection = async (name: string) => {
    setCollectionToDelete(name);
    setShowDeleteCollectionConfirm(true);
  };

  const handleDeleteCollectionConfirm = async () => {
    if (!collectionToDelete) return;

    try {
      setLoading(true);
      setError(null);

      await chromaService.deleteCollection(collectionToDelete);

      // 更新集合列表
      await fetchCollections();

      setSuccess('集合删除成功');
    } catch (err) {
      const errorMessage = (err as Error).message;
      // 检查是否是连接错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。');
      } else {
        setError('集合删除失败: ' + errorMessage);
      }
    } finally {
      setLoading(false);
      setShowDeleteCollectionConfirm(false);
      setCollectionToDelete(null);
    }
  };

  // 初始化时获取集合列表
  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 主内容区 */}
      <main className="flex-1 p-8 overflow-auto">
        {/* 顶部导航 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                Collections
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage your Chroma DB collections
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={openSettingsModal}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm"
              >
                Settings
              </button>
              <button
                onClick={openCreateDrawer}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Create Collection
              </button>
              <Link
                href="/server"
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm"
              >
                Server Status
              </Link>
            </div>
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {/* 集合列表 */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Existing Collections</h3>
                <button
                  onClick={fetchCollections}
                  disabled={loading}
                  className="flex items-center text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="mr-1">
                        <LoadingSpinner size="sm" />
                      </div>
                      Refreshing...
                    </>
                  ) : (
                    'Refresh'
                  )}
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner message="Loading collections..." />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collections.map((collection) => (
                    <div key={collection.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">{collection.name}</h4>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ID: {collection.id?.substring(0, 8)}...
                          </div>
                        </div>
                        <button
                          onClick={() => deleteCollection(collection.name)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete collection"
                        >
                          ✕
                        </button>
                      </div>
                      {collection.metadata && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {Object.entries(collection.metadata).map(([key, value]) => (
                            <div key={key}>{key}: {JSON.stringify(value)}</div>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex justify-end">
                        <Link
                          href={`/collection/${collection.name}`}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Manage Records
                        </Link>
                      </div>
                    </div>
                  ))}
                  {collections.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                      No collections found. Create your first collection!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 创建集合抽屉 */}
          <Drawer
            isOpen={isCreateDrawerOpen}
            onClose={closeCreateDrawer}
            title="Create New Collection"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Enter collection name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={creatingCollection}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Metadata (JSON, optional)
                </label>
                <textarea
                  value={newCollectionMetadata}
                  onChange={(e) => setNewCollectionMetadata(e.target.value)}
                  placeholder='{"key": "value"}'
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={4}
                  disabled={creatingCollection}
                />
              </div>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={closeCreateDrawer}
                  disabled={creatingCollection}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={createCollection}
                  disabled={creatingCollection}
                  className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {creatingCollection ? (
                    <>
                      <div className="mr-2">
                        <LoadingSpinner size="sm" />
                      </div>
                      Creating...
                    </>
                  ) : (
                    'Create Collection'
                  )}
                </button>
              </div>
            </div>
          </Drawer>

          {/* 设置模态框 */}
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            onSave={handleSettingsSaved}
          />

          {/* 确认对话框 */}
          <ConfirmationDialog
            isOpen={showDeleteCollectionConfirm}
            onClose={() => {
              setShowDeleteCollectionConfirm(false);
              setCollectionToDelete(null);
            }}
            onConfirm={handleDeleteCollectionConfirm}
            title="确认删除集合"
            message={`确定要删除集合 "${collectionToDelete}" 吗？`}
            confirmText="删除"
            cancelText="取消"
          />
        </div>
      </main>
    </div>
  );
}
