'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import { Icon } from '@iconify/react';

export default function CollectionsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-8 max-w-5xl mx-auto space-y-10">
        {/* 顶部标题 */}
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400 tracking-wide uppercase">Collections</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            选择集合
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            从左侧边栏选择一个集合开始管理，或新建一个集合以组织你的向量数据。
          </p>
        </div>

        {/* 提示卡片 */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>现有集合</CardTitle>
              <CardDescription>
                从左侧边栏选择一个已存在的集合进行查看和管理。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                支持查看元数据、浏览记录、执行查询等操作，帮助你快速了解集合状态。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>新建集合</CardTitle>
              <CardDescription>
                点击左侧边栏顶部的「+」按钮创建新的集合。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                可以为集合添加描述、标签等元数据，方便后续筛选和管理。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 操作指南 */}
        <Alert className="border-blue-200/70 dark:border-blue-700/70 bg-blue-50/70 dark:bg-blue-900/20">
          <AlertTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
            <Icon icon="heroicons:light-bulb" className="w-5 h-5 text-yellow-500" />
            <span>如何使用集合管理</span>
          </AlertTitle>
          <AlertDescription>
            <ol className="space-y-3 text-slate-600 dark:text-slate-300 list-none pl-0 mt-3">
              <li className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 text-xs font-semibold mt-0.5">1</span>
                <span>在左侧边栏浏览或搜索可用的集合。</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 text-xs font-semibold mt-0.5">2</span>
                <span>点击任意集合进入详情页面，查看记录和向量信息。</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 text-xs font-semibold mt-0.5">3</span>
                <span>在详情页面管理记录、执行查询或修改集合设置。</span>
              </li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
