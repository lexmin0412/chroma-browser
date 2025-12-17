'use client';

import React from 'react';

export default function CollectionsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto">
        {/* 顶部标题 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            选择集合
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            从左侧边栏选择一个集合开始管理
          </p>
        </div>

        {/* 提示卡片 */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              现有集合
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              从左侧边栏选择一个已存在的集合进行查看和管理
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="text-4xl mb-4">➕</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              新建集合
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              点击左侧边栏的创建按钮添加新的集合
            </p>
          </div>
        </div>

        {/* 操作指南 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-700 p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            如何使用
          </h3>
          <ol className="space-y-4 text-slate-600 dark:text-slate-300">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 font-medium mr-3 mt-0.5">1</span>
              <span>在左侧边栏浏览或搜索可用的集合</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 font-medium mr-3 mt-0.5">2</span>
              <span>点击任意集合进入详情页面</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 font-medium mr-3 mt-0.5">3</span>
              <span>在详情页面管理记录、查询数据或修改集合设置</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
