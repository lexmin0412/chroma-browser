'use client';

import React, { useState, useEffect } from 'react';
import { chromaService } from '@/app/utils/chroma-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from '@/components/ui/sidebar';

import type { Collection } from 'chromadb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';

export default function CollectionsLayout({ children, params }: { children: React.ReactNode, params: Promise<{
	connectionId: string
	id: string
}> }) {
  // 状态管理
	const [connectionId, setConnectionId] = useState('')

	const pathname = usePathname()
	const selectedCollectionId = pathname.slice(pathname.lastIndexOf('/') + 1)

	useEffect(()=>{
		const init = async() => {
			const { connectionId, id: collectionId } = await params
			setConnectionId(connectionId)
		}
		init()
	}, [])
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 创建集合相关状态
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionMetadata, setNewCollectionMetadata] = useState(''); // JSON string

  // 确认对话框状态
  const [showDeleteCollectionConfirm, setShowDeleteCollectionConfirm] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);



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

      console.log('集合创建成功');
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

      console.log('集合删除成功');
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
    <div className="h-full bg-slate-50 dark:bg-slate-950">
      <SidebarProvider>
        <div className="flex h-full">
          <Sidebar className="hidden md:block md:top-16 md:h-[calc(100vh-4rem)]">
            <SidebarHeader className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <h5 className="text-lg font-semibold text-slate-900 dark:text-white">Collections</h5>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchCollections}
                    disabled={loading}
                    className="h-8 w-8"
                    title="Refresh collections"
                  >
                    {loading ? <Spinner className="h-4 w-4" /> : <Icon icon="material-symbols:refresh" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={openCreateDrawer}
                    className="h-8 w-8"
                    title="Create collection"
                  >
                    <Icon icon="material-symbols:add" />
                  </Button>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent className="p-2 space-y-1">
              {loading ? (
                <div className="p-4 text-center">
                  <Spinner className="h-4 w-4 mx-auto" />
                </div>
              ) : collections.length > 0 ? (
                collections.map((collection) => {
                  const isSelected = selectedCollectionId === collection.name
									console.log('collectionId', selectedCollectionId, collection.id)
                  return (
                    <div key={collection.id} className="group">
                      <Link
                        href={`/${connectionId}/collections/${collection.name}`}
                        className={`flex items-center justify-between p-2 rounded-r-lg text-slate-900 dark:text-white transition-all ${isSelected ? 'bg-violet-100 dark:bg-violet-900/30 border-l-4 border-violet-500 dark:border-violet-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      >
                        <span className={`font-medium text-sm truncate ${isSelected ? 'text-violet-700 dark:text-violet-300' : ''}`}>{collection.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteCollection(collection.name);
                          }}
                          title="Delete collection"
                        >
                          ✕
                        </Button>
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="p-4">
                  <Empty>
                    <EmptyMedia>
                      <div className="text-4xl">📚</div>
                    </EmptyMedia>
                    <EmptyTitle>No collections</EmptyTitle>
                    <EmptyDescription>
                      <Button
                        onClick={openCreateDrawer}
                        className="mt-4"
                        size="sm"
                      >
                        Create Collection
                      </Button>
                    </EmptyDescription>
                </Empty>
              </div>
            )}
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 h-full overflow-y-auto">
        {children}

        {/* 创建集合对话框 */}
        <Dialog open={isCreateDrawerOpen} onOpenChange={(open) => !open && closeCreateDrawer()}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div>
                <Label htmlFor="collection-name">Collection Name *</Label>
                <Input
                  id="collection-name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., my-documents"
                  disabled={creatingCollection}
                />
              </div>
              <div>
                <Label htmlFor="metadata">Metadata (JSON, optional)</Label>
                <Textarea
                  id="metadata"
                  value={newCollectionMetadata}
                  onChange={(e) => setNewCollectionMetadata(e.target.value)}
                  placeholder='{"description": "My collection", "version": "1.0"}'
                  rows={4}
                  disabled={creatingCollection}
                  className="font-mono text-sm"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeCreateDrawer}
                disabled={creatingCollection}
              >
                Cancel
              </Button>
              <Button
                onClick={createCollection}
                disabled={creatingCollection}
              >
                {creatingCollection ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span className="ml-2">Create Collection</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>



        {/* 确认对话框 */}
        <Dialog open={showDeleteCollectionConfirm} onOpenChange={(open) => !open && setShowDeleteCollectionConfirm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete Collection</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Are you sure you want to delete the collection "{collectionToDelete}"?
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteCollectionConfirm(false);
                  setCollectionToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCollectionConfirm}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </main>
      </div>
    </SidebarProvider>
  </div>
);
}
