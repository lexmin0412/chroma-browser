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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {/* 顶部导航 */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  ChromaDB Browser
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Manage your ChromaDB vector collections
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={openSettingsModal}
                  className="inline-flex items-center px-4 py-2 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium text-sm shadow-lg hover:shadow-xl hover:shadow-purple-500/30"
                >
                  ⚙️ Settings
                </button>
                <button
                  onClick={openCreateDrawer}
                  className="inline-flex items-center px-4 py-2 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium text-sm shadow-lg hover:shadow-xl hover:shadow-purple-500/30"
                >
                  ✨ New Collection
                </button>
                <Link
                  href="/server"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium text-sm shadow-lg hover:shadow-xl hover:shadow-purple-500/30"
                >
                  📊 Server Status
                </Link>
              </div>
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

          {/* 集合列表卡片 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* 头部 */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Existing Collections</h2>
              <button
                onClick={fetchCollections}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner message="Loading collections..." />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collections.map((collection) => (
                    <div key={collection.id} className="group relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-700/50 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 hover:shadow-md transition-all hover:border-sky-300 dark:hover:border-violet-600 dark:border-violet-400 duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{collection.name}</h3>
                          <code className="text-xs text-slate-500 dark:text-slate-400 font-mono break-all">
                            {collection.id?.substring(0, 12)}...
                          </code>
                        </div>
                        <button
                          onClick={() => deleteCollection(collection.name)}
                          className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-all"
                          title="Delete collection"
                        >
                          ✕
                        </button>
                      </div>
                      {collection.metadata && Object.keys(collection.metadata).length > 0 && (
                        <div className="mb-4 py-3 px-3 bg-slate-100 dark:bg-slate-900/30 rounded border border-slate-200 dark:border-slate-700/50">
                          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Metadata</div>
                          <div className="space-y-1">
                            {Object.entries(collection.metadata).map(([key, value]) => (
                              <div key={key} className="text-xs text-slate-600 dark:text-slate-300">
                                <span className="font-mono text-slate-500">{key}:</span> {JSON.stringify(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Link
                          href={`/collection/${collection.name}`}
                          className="inline-flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium text-sm shadow-md hover:shadow-lg"
                        >
                          📋 Manage Records
                        </Link>
                      </div>
                    </div>
                  ))}
                  {collections.length === 0 && (
                    <div className="col-span-full text-center py-16">
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Collections</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first collection to get started</p>
                      <button
                        onClick={openCreateDrawer}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl hover:shadow-purple-500/30"
                      >
                        ✨ Create Collection
                      </button>
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
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., my-documents"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                  disabled={creatingCollection}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Metadata (JSON, optional)
                </label>
                <textarea
                  value={newCollectionMetadata}
                  onChange={(e) => setNewCollectionMetadata(e.target.value)}
                  placeholder='{"description": "My collection", "version": "1.0"}'
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors font-mono text-sm"
                  rows={4}
                  disabled={creatingCollection}
                />
              </div>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={closeCreateDrawer}
                  disabled={creatingCollection}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={createCollection}
                  disabled={creatingCollection}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:from-violet-400 disabled:to-purple-400 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 disabled:shadow-none"
                >
                  {creatingCollection ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Create Collection</span>
                    </>
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
