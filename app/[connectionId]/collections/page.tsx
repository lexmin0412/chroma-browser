'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { chromaService } from '@/app/utils/chroma-service';
import { IConnectionItem } from '@/types';

interface Collection {
  id: string;
  name: string;
  metadata?: Record<string, unknown>;
}

export default function CollectionsPage() {
  const router = useRouter();
	const { connectionId } = useParams<{ connectionId: string }>()
  const [collections, setCollections] = useState<Collection[]>([]);
  const [connections, setConnections] = useState<IConnectionItem[]>([]);
  const [currentConnectionId, setCurrentConnectionId] = useState<number | null>(null);
  const [currentConnection, setCurrentConnection] = useState<IConnectionItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取连接列表
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch("/api/connections");
        if (!response.ok) {
          throw new Error("Failed to fetch connections");
        }
        const data = await response.json();
        setConnections(data);
      } catch (err) {
        setError("Failed to load connections");
        console.error("Error fetching connections:", err);
      }
    };

    fetchConnections();
  }, []);

  // 初始化连接并获取集合列表
  useEffect(() => {
    const initializeConnection = async (connId: number) => {
      try {
        setIsLoading(true);
        setError(null);

        // 设置当前连接
        chromaService.setCurrentConnection(connId);

        // 获取当前连接信息
        const connection = connections.find(conn => conn.id === connId);
        if (connection) {
          setCurrentConnection(connection);
        }

        // 获取集合列表
        const response = await fetch(`/api/collections?connectionId=${connId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch collections");
        }
        const data = await response.json();
        const collectionsList = data.collections || [];
        setCollections(collectionsList);

        // 如果集合列表不为空，自动跳转到第一个集合
        if (collectionsList.length > 0) {
          router.replace(`/${connId}/collections/${collectionsList[0].name}`);
        }
      } catch (err) {
        setError("Failed to initialize connection or fetch collections");
        console.error("Error initializing connection:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (connectionId) {
      const connId = parseInt(connectionId, 10);
      if (!isNaN(connId)) {
        setCurrentConnectionId(connId);
        initializeConnection(connId);
      }
    }
  }, [connectionId, connections, router]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-8 max-w-6xl mx-auto space-y-8">

        {/* 错误提示 */}
        {error && (
          <Alert className="border-red-200/70 dark:border-red-700/70 bg-red-50/70 dark:bg-red-900/20">
            <AlertTitle className="flex items-center gap-2 text-red-900 dark:text-red-50">
              <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-red-500" />
              <span>错误</span>
            </AlertTitle>
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-2 text-slate-500">
              <Icon icon="heroicons:arrow-path" className="w-5 h-5 animate-spin" />
              <span>加载中...</span>
            </div>
          </div>
        )}

        {/* 空连接列表 */}
        {!isLoading && connections.length === 0 && (
          <Alert className="border-orange-200/70 dark:border-orange-700/70 bg-orange-50/70 dark:bg-orange-900/20">
            <AlertTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-50">
              <Icon icon="heroicons:link" className="w-5 h-5 text-orange-500" />
              <span>暂无连接</span>
            </AlertTitle>
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              还没有配置任何连接。请点击导航栏中的&ldquo;连接&rdquo;按钮来添加您的第一个数据库连接。
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
