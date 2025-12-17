'use client';

import React, { useState, useEffect } from 'react';
import { chromaService } from '../utils/chroma-service';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationDialog from '../components/ConfirmationDialog';
import Drawer from '../components/Drawer';

import type { Collection } from 'chromadb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  // 状态管理
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 获取当前路径以判断选中的集合
  const pathname = usePathname();

  // 创建集合相关状态
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionMetadata, setNewCollectionMetadata] = useState(''); // JSON string

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
        setError('无法连接到 Vector DB 服务器，请确保服务器正在运行并可访问。')
      } else {
        setError('获取集合失败: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
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
        setError('无法连接到 Vector DB 服务器，请确保服务器正在运行并可访问。')
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
        setError('无法连接到 Vector DB 服务器，请确保服务器正在运行并可访问。')
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
    <div className="flex h-full bg-slate-50 dark:bg-slate-950">
      {/* 左侧集合列表 */}
      <aside className="w-64 bg-gray-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm h-full overflow-y-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <h5 className="text-lg font-semibold text-slate-900 dark:text-white">Collections</h5>
            <div className="flex gap-2">
              <button
                onClick={fetchCollections}
                disabled={loading}
                className="p-1.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="Refresh collections"
              >
                {loading ? <LoadingSpinner size="sm" /> : "🔄"}
              </button>
              <button
                onClick={openCreateDrawer}
                className="p-1.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="Create collection"
              >
                ➕
              </button>
            </div>
          </div>
        </div>
        <nav className="p-2 space-y-1">
          {loading ? (
            <div className="p-4 text-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : collections.length > 0 ? (
            collections.map((collection) => {
              const isSelected = pathname === `/collections/${collection.name}`;
              return (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.name}`}
                  className={`flex items-center justify-between p-3 rounded-lg text-slate-900 dark:text-white transition-all group ${isSelected ? 'bg-violet-100 dark:bg-violet-900/30 border-l-4 border-violet-500 dark:border-violet-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  <span className={`font-medium ${isSelected ? 'text-violet-700 dark:text-violet-300' : ''}`}>{collection.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCollection(collection.name);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                    title="Delete collection"
                  >
                    ✕
                  </button>
                </Link>
              );
            })
          ) : (
            <div className="p-4 text-center">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">No collections</p>
              <button
                onClick={openCreateDrawer}
                className="mt-4 px-3 py-1.5 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
              >
                Create Collection
              </button>
            </div>
          )}
        </nav>
      </aside>

      {/* 右侧内容区域，渲染子页面 */}
      <main className="flex-1 h-full overflow-y-auto">
        {children}

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
                className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:from-violet-400 disabled:to-purple-400 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 disabled:shadow-none"
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
      </main>
    </div>
  );
}
