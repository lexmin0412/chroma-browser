'use client';

import React, { useState, useEffect } from 'react';
import { chromaService } from '../../utils/chroma-service';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import SettingsModal from '../../components/SettingsModal';
import Notification from './Notification';
import RecordsTabs from './collection/RecordsTabs';
import type { GetResult, QueryResult, Metadata } from 'chromadb';

export default function CollectionDetailQuery({ params: routeParams }: { params: { id: string } }) {
  const [collectionName, setCollectionName] = useState('');
	console.log('collectionName in render', collectionName)

	const init = async() => {
		const routeParamsObj = await routeParams
		console.log('routeParamsObj', routeParamsObj)
		const collectionName = routeParamsObj.id
		setCollectionName(collectionName)
		fetchRecordCount(collectionName)
	}

	useEffect(()=>{
		init()
	}, [])

  // 状态管理
  const [records, setRecords] = useState<GetResult<Metadata> | QueryResult<Metadata> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 设置相关状态
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 记录管理相关状态
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [activeRecordTab, setActiveRecordTab] = useState('add');
  const [recordCount, setRecordCount] = useState(0);

  // 添加记录状态
  const [addingRecords, setAddingRecords] = useState(false);
  const [newRecordIds, setNewRecordIds] = useState('');
  const [newRecordEmbeddings, setNewRecordEmbeddings] = useState('');
  const [newRecordMetadatas, setNewRecordMetadatas] = useState('');
  const [newRecordDocuments, setNewRecordDocuments] = useState('');

  // 查询记录状态
  const [queryingRecords, setQueryingRecords] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [queryEmbedding, setQueryEmbedding] = useState('');
  const [queryNResults, setQueryNResults] = useState('5');
  const [queryWhere, setQueryWhere] = useState('');

  // 获取记录状态
  const [fetchingRecords, setFetchingRecords] = useState(false);
  const [getRecordIds, setGetRecordIds] = useState('');
  const [getRecordWhere, setGetRecordWhere] = useState('');
  const [getRecordLimit, setGetRecordLimit] = useState('10');

  // 删除记录状态
  const [deletingRecords, setDeletingRecords] = useState(false);
  const [deleteRecordIds, setDeleteRecordIds] = useState('');
  const [deleteRecordWhere, setDeleteRecordWhere] = useState('');

  // 更新记录状态
  const [updatingRecords, setUpdatingRecords] = useState(false);
  const [updateRecordIds, setUpdateRecordIds] = useState('');
  const [updateRecordEmbeddings, setUpdateRecordEmbeddings] = useState('');
  const [updateRecordMetadatas, setUpdateRecordMetadatas] = useState('');
  const [updateRecordDocuments, setUpdateRecordDocuments] = useState('');

  // 插入更新记录状态
  const [upsertingRecords, setUpsertingRecords] = useState(false);
  const [upsertRecordIds, setUpsertRecordIds] = useState('');
  const [upsertRecordEmbeddings, setUpsertRecordEmbeddings] = useState('');
  const [upsertRecordMetadatas, setUpsertRecordMetadatas] = useState('');
  const [upsertRecordDocuments, setUpsertRecordDocuments] = useState('');

  // 确认对话框状态
  const [showDeleteRecordsConfirm, setShowDeleteRecordsConfirm] = useState(false);
  const [showUpdateRecordsConfirm, setShowUpdateRecordsConfirm] = useState(false);
  const [showUpsertRecordsConfirm, setShowUpsertRecordsConfirm] = useState(false);
  const [deleteParams, setDeleteParams] = useState<{ ids?: string[]; where?: Metadata } | null>(null);
  const [updateParams, setUpdateParams] = useState<{ ids: string[]; embeddings?: number[][]; metadatas?: Metadata[]; documents?: string[] } | null>(null);
  const [upsertParams, setUpsertParams] = useState<{ ids: string[]; embeddings?: number[][]; metadatas?: Metadata[]; documents?: string[] } | null>(null);

  // 清空通知
  const clearNotifications = () => {
    setError(null);
    setSuccess(null);
  };

  // 获取集合记录数量
  const fetchRecordCount = async (name: string = collectionName) => {
    try {
      setRecordsLoading(true);
      const count = await chromaService.countRecords(name);
      setRecordCount(count);
    } catch (err) {
      console.error('Failed to fetch record count:', err);
    } finally {
      setRecordsLoading(false);
    }
  }

  // 添加记录
  const addRecords = async () => {
    if (!newRecordIds.trim()) {
      setError('至少提供一个ID');
      return;
    }

    try {
      setAddingRecords(true);
      setError(null);

      // 解析输入
      const ids = newRecordIds.split(',').map(id => id.trim()).filter(Boolean);

      // 验证 IDs 格式
      for (const id of ids) {
        if (!/^[a-zA-Z0-9\-_]+$/.test(id)) {
          throw new Error(`ID "${id}" 包含无效字符，只能包含字母、数字、连字符(-)和下划线(_)`);
        }
      }

      let embeddings: number[][] | undefined = undefined;
      let metadatas: Metadata[] | undefined = undefined;
      let documents: string[] | undefined = undefined;

      // 解析嵌入向量
      if (newRecordEmbeddings.trim()) {
        try {
          embeddings = JSON.parse(newRecordEmbeddings);
          if (!Array.isArray(embeddings)) {
            throw new Error('嵌入向量必须是有效的 JSON 数组');
          }

          // 验证嵌入向量格式
          for (let i = 0; i < embeddings.length; i++) {
            if (!Array.isArray(embeddings[i])) {
              throw new Error(`嵌入向量第 ${i+1} 项必须是数组`);
            }

            // 验证每个元素都是数字
            for (let j = 0; j < embeddings[i].length; j++) {
              if (typeof embeddings[i][j] !== 'number') {
                throw new Error(`嵌入向量[${i}][${j}] 必须是数字`);
              }
            }
          }
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error('嵌入向量 JSON 格式无效: ' + parseError.message);
          }
          throw parseError;
        }
      }

      // 解析元数据
      if (newRecordMetadatas.trim()) {
        try {
          metadatas = JSON.parse(newRecordMetadatas);
          if (!Array.isArray(metadatas)) {
            throw new Error('元数据必须是有效的 JSON 数组');
          }

          // 验证元数据格式
          for (let i = 0; i < metadatas.length; i++) {
            if (typeof metadatas[i] !== 'object' || Array.isArray(metadatas[i]) || metadatas[i] === null) {
              throw new Error(`元数据第 ${i+1} 项必须是对象`);
            }
          }
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error('元数据 JSON 格式无效: ' + parseError.message);
          }
          throw parseError;
        }
      }

      // 解析文档
      if (newRecordDocuments.trim()) {
        documents = newRecordDocuments.split(',').map(doc => doc.trim()).filter(Boolean);
      }

      // 验证数据一致性
      const dataArrays = [embeddings, metadatas, documents].filter(Boolean);
      for (const array of dataArrays) {
        if (array && array.length !== ids.length) {
          throw new Error('所有数据数组（嵌入向量、元数据、文档）的长度必须与IDs相同');
        }
      }

      // 添加记录
      await chromaService.addRecords(collectionName, { ids, embeddings, metadatas, documents });

      // 重置表单
      setNewRecordIds('');
      setNewRecordEmbeddings('');
      setNewRecordMetadatas('');
      setNewRecordDocuments('');

      // 更新记录数量
      await fetchRecordCount();

      setSuccess('记录添加成功');
    } catch (err) {
      const errorMessage = (err as Error).message;
      // 检查是否是连接错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。');
      } else {
        setError('记录添加失败: ' + errorMessage);
      }
    } finally {
      setAddingRecords(false);
    }
  };

  // 查询记录
  const queryRecords = async () => {
    if (!queryText.trim() && !queryEmbedding.trim()) {
      setError('查询文本或查询嵌入向量是必需的');
      return;
    }

    try {
      setQueryingRecords(true);
      setError(null);

      // 准备查询参数
      const nResults = parseInt(queryNResults) || 5;

      // 验证 nResults 参数
      if (nResults <= 0 || nResults > 1000) {
        throw new Error('返回结果数量必须在 1-1000 之间');
      }

      const params: {
        nResults: number;
        include: ('embeddings' | 'metadatas' | 'documents' | 'distances')[];
        queryTexts?: string[];
        queryEmbeddings?: number[][];
        where?: import('chromadb').Where;
      } = {
        nResults,
        include: ['embeddings', 'metadatas', 'documents', 'distances']
      };

      // 解析查询条件
      if (queryText.trim()) {
        params.queryTexts = queryText.split(',').map(text => text.trim()).filter(Boolean);
      } else if (queryEmbedding.trim()) {
        try {
          params.queryEmbeddings = JSON.parse(queryEmbedding);

          // 验证嵌入向量格式
          if (!Array.isArray(params.queryEmbeddings)) {
            throw new Error('查询嵌入向量必须是有效的 JSON 数组');
          }

          // 验证每个元素都是数字数组
          for (let i = 0; i < params.queryEmbeddings.length; i++) {
            if (!Array.isArray(params.queryEmbeddings[i])) {
              throw new Error(`查询嵌入向量第 ${i+1} 项必须是数组`);
            }

            for (let j = 0; j < params.queryEmbeddings[i].length; j++) {
              if (typeof params.queryEmbeddings[i][j] !== 'number') {
                throw new Error(`查询嵌入向量[${i}][${j}] 必须是数字`);
              }
            }
          }
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error('查询嵌入向量 JSON 格式无效: ' + parseError.message);
          }
          throw parseError;
        }
      }

      // 解析 where 条件
      if (queryWhere.trim()) {
        try {
          params.where = JSON.parse(queryWhere);

          // 验证 where 条件是否为对象
          if (typeof params.where !== 'object' || Array.isArray(params.where) || params.where === null) {
            throw new Error('Where 条件必须是一个有效的 JSON 对象');
          }
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error('Where 条件 JSON 格式无效: ' + parseError.message);
          }
          throw parseError;
        }
      }

      // 执行查询
      const results = await chromaService.queryRecords(collectionName, params);
      setRecords(results);

      setSuccess('记录查询成功');
    } catch (err) {
      const errorMessage = (err as Error).message;
      // 检查是否是连接错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。');
      } else {
        setError('记录查询失败: ' + errorMessage);
      }
    } finally {
      setQueryingRecords(false);
    }
  };

  // 获取记录
  const getRecords = async () => {
    try {
      setFetchingRecords(true);
      setError(null);

      // 准备参数
      const params: {
        ids?: string[];
        where?: import('chromadb').Where;
        limit?: number;
        include?: ('embeddings' | 'metadatas' | 'documents')[];
      } = {};

      // 解析 IDs
      if (getRecordIds.trim()) {
        params.ids = getRecordIds.split(',').map(id => id.trim()).filter(Boolean);

        // 验证 IDs 格式
        for (const id of params.ids) {
          if (!/^[a-zA-Z0-9\-_]+$/.test(id)) {
            throw new Error(`ID "${id}" 包含无效字符，只能包含字母、数字、连字符(-)和下划线(_)`);
          }
        }
      }

      // 解析 where 条件
      if (getRecordWhere.trim()) {
        try {
          params.where = JSON.parse(getRecordWhere);

          // 验证 where 条件是否为对象
          if (typeof params.where !== 'object' || Array.isArray(params.where) || params.where === null) {
            throw new Error('Where 条件必须是一个有效的 JSON 对象');
          }
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error('Where 条件 JSON 格式无效: ' + parseError.message);
          }
          throw parseError;
        }
      }

      // 解析 limit
      if (getRecordLimit.trim()) {
        const limit = parseInt(getRecordLimit);
        if (isNaN(limit) || limit <= 0 || limit > 1000) {
          throw new Error('Limit 必须是 1-1000 之间的有效数字');
        }
        params.limit = limit;
      }

      params.include = ['embeddings', 'metadatas', 'documents'];

      // 执行查询
      const results = await chromaService.getRecords(collectionName, params);
      setRecords(results);

      setSuccess('记录获取成功');
    } catch (err) {
      const errorMessage = (err as Error).message;
      // 检查是否是连接错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。');
      } else {
        setError('记录获取失败: ' + errorMessage);
      }
    } finally {
      setFetchingRecords(false);
    }
  };

  // 删除记录
  const deleteRecords = async () => {
    if (!deleteRecordIds.trim() && !deleteRecordWhere.trim()) {
      setError('必须提供ID或筛选条件才能删除记录');
      return;
    }

    setShowDeleteRecordsConfirm(true);
  };

  const handleDeleteRecordsConfirm = async () => {
    try {
      setDeletingRecords(true);
      setError(null);

      // 准备参数
      const params: {
        ids?: string[];
        where?: import('chromadb').Where;
      } = {};

      // 解析 IDs
      if (deleteRecordIds.trim()) {
        params.ids = deleteRecordIds.split(',').map(id => id.trim()).filter(Boolean);

        // 验证 IDs 格式
        for (const id of params.ids) {
          if (!/^[a-zA-Z0-9\-_]+$/.test(id)) {
            throw new Error(`ID "${id}" 包含无效字符，只能包含字母、数字、连字符(-)和下划线(_)`);
          }
        }
      }

      // 解析 where 条件
      if (deleteRecordWhere.trim()) {
        try {
          params.where = JSON.parse(deleteRecordWhere);

          // 验证 where 条件是否为对象
          if (typeof params.where !== 'object' || Array.isArray(params.where) || params.where === null) {
            throw new Error('Where 条件必须是一个有效的 JSON 对象');
          }
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error('Where 条件 JSON 格式无效: ' + parseError.message);
          }
          throw parseError;
        }
      }

      // 执行删除
      await chromaService.deleteRecords(collectionName, params);

      // 重置表单
      setDeleteRecordIds('');
      setDeleteRecordWhere('');

      // 更新记录数量
      await fetchRecordCount();

      setSuccess('记录删除成功');
    } catch (err) {
      const errorMessage = (err as Error).message;
      // 检查是否是连接错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。');
      } else {
        setError('记录删除失败: ' + errorMessage);
      }
    } finally {
      setDeletingRecords(false);
      setShowDeleteRecordsConfirm(false);
    }
  };

  // 更新记录
  const updateRecords = async () => {
    if (!updateRecordIds.trim()) {
      setError('至少提供一个ID');
      return;
    }

    try {
      setError(null);

      // 解析输入
      const ids = updateRecordIds.split(',').map(id => id.trim()).filter(Boolean);

      // 验证 IDs 格式
      for (const id of ids) {
        if (!/^[a-zA-Z0-9\-_]+$/.test(id)) {
          throw new Error(`ID "${id}" 包含无效字符，只能包含字母、数字、连字符(-)和下划线(_)`);
        }
      }

      let embeddings: number[][] | undefined = undefined;
      let metadatas: Metadata[] | undefined = undefined;
      let documents: string[] | undefined = undefined;

      // 解析嵌入向量
      if (updateRecordEmbeddings.trim()) {
        try {
          embeddings = JSON.parse(updateRecordEmbeddings);
          if (!Array.isArray(embeddings)) {
            throw new Error('嵌入向量必须是有效的 JSON 数组');
          }

          // 验证嵌入向量格式
          for (let i = 0; i < embeddings.length; i++) {
            if (!Array.isArray(embeddings[i])) {
              throw new Error(`嵌入向量第 ${i+1} 项必须是数组`);
            }

            // 验证每个元素都是数字
            for (let j = 0; j < embeddings[i].length; j++) {
              if (typeof embeddings[i][j] !== 'number') {
                throw new Error(`嵌入向量[${i}][${j}] 必须是数字`);
              }
            }
          }
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error('嵌入向量 JSON 格式无效: ' + parseError.message);
          }
          throw parseError;
        }
      }

      // 解析元数据
      if (updateRecordMetadatas.trim()) {
        try {
          metadatas = JSON.parse(updateRecordMetadatas);
          if (!Array.isArray(metadatas)) {
            throw new Error('元数据必须是有效的 JSON 数组');
          }

          // 验证元数据格式
          for (let i = 0; i < metadatas.length; i++) {
            if (typeof metadatas[i] !== 'object' || Array.isArray(metadatas[i]) || metadatas[i] === null) {
              throw new Error(`元数据第 ${i+1} 项必须是对象`);
            }
          }
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error('元数据 JSON 格式无效: ' + parseError.message);
          }
          throw parseError;
        }
      }

      // 解析文档
      if (updateRecordDocuments.trim()) {
        documents = updateRecordDocuments.split(',').map(doc => doc.trim()).filter(Boolean);
      }

      // 验证数据一致性
      const dataArrays = [embeddings, metadatas, documents].filter(Boolean);
      for (const array of dataArrays) {
        if (array && array.length !== ids.length) {
          throw new Error('所有数据数组（嵌入向量、元数据、文档）的长度必须与IDs相同');
        }
      }

      // 设置参数并显示确认对话框
      setUpdateParams({ ids, embeddings, metadatas, documents });
      setShowUpdateRecordsConfirm(true);
    } catch (err) {
      const errorMessage = (err as Error).message;
      // 检查是否是连接错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。');
      } else {
        setError('记录更新失败: ' + errorMessage);
      }
    }
  };

  const handleUpdateRecordsConfirm = async () => {
    try {
      setUpdatingRecords(true);
      setError(null);

      if (!updateParams) {
        throw new Error('更新参数未设置');
      }

      // 执行更新
      await chromaService.updateRecords(collectionName, updateParams);

      // 重置表单
      setUpdateRecordIds('');
      setUpdateRecordEmbeddings('');
      setUpdateRecordMetadatas('');
      setUpdateRecordDocuments('');

      setSuccess('记录更新成功');
    } catch (err) {
      const errorMessage = (err as Error).message;
      // 检查是否是连接错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。');
      } else {
        setError('记录更新失败: ' + errorMessage);
      }
    } finally {
      setUpdatingRecords(false);
      setShowUpdateRecordsConfirm(false);
      setUpdateParams(null);
    }
  };

  // 插入更新记录
  const upsertRecords = async () => {
    if (!upsertRecordIds.trim()) {
      setError('必须至少提供一个ID');
      return;
    }

    try {
      setError(null);

      // 解析输入
      const ids = upsertRecordIds.split(',').map(id => id.trim()).filter(Boolean);
      let embeddings: number[][] | undefined = undefined;
      let metadatas: Metadata[] | undefined = undefined;
      let documents: string[] | undefined = undefined;

      // 解析嵌入向量
      if (upsertRecordEmbeddings.trim()) {
        embeddings = JSON.parse(upsertRecordEmbeddings);
        if (!Array.isArray(embeddings)) {
          throw new Error('嵌入向量必须是有效的 JSON 数组');
        }
      }

      // 解析元数据
      if (upsertRecordMetadatas.trim()) {
        metadatas = JSON.parse(upsertRecordMetadatas);
        if (!Array.isArray(metadatas)) {
          throw new Error('元数据必须是有效的 JSON 数组');
        }
      }

      // 解析文档
      if (upsertRecordDocuments.trim()) {
        documents = upsertRecordDocuments.split(',').map(doc => doc.trim()).filter(Boolean);
      }

      // 验证数据一致性
      const dataArrays = [embeddings, metadatas, documents].filter(Boolean);
      for (const array of dataArrays) {
        if (array && array.length !== ids.length) {
          throw new Error('所有数据数组（嵌入向量、元数据、文档）的长度必须与IDs相同');
        }
      }

      // 设置参数并显示确认对话框
      setUpsertParams({ ids, embeddings, metadatas, documents });
      setShowUpsertRecordsConfirm(true);
    } catch (err) {
      const errorMessage = (err as Error).message;
      // 检查是否是连接错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。');
      } else {
        setError('记录插入更新失败: ' + errorMessage);
      }
    }
  };

  const handleUpsertRecordsConfirm = async () => {
    try {
      setUpsertingRecords(true);
      setError(null);

      if (!upsertParams) {
        throw new Error('插入更新参数未设置');
      }

      // 插入更新记录
      await chromaService.upsertRecords(collectionName, upsertParams);

      // 重置表单
      setUpsertRecordIds('');
      setUpsertRecordEmbeddings('');
      setUpsertRecordMetadatas('');
      setUpsertRecordDocuments('');

      // 更新记录数量
      await fetchRecordCount();

      setSuccess('记录插入更新成功');
    } catch (err) {
      const errorMessage = (err as Error).message;
      // 检查是否是连接错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。');
      } else {
        setError('记录插入更新失败: ' + errorMessage);
      }
    } finally {
      setUpsertingRecords(false);
      setShowUpsertRecordsConfirm(false);
      setUpsertParams(null);
    }
  };

  // 自动清空通知
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearNotifications, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);



  // 保存设置后的回调
  const handleSettingsSaved = () => {
    // 显示成功消息
    setSuccess('Configuration saved successfully!');

    // 重新加载记录计数以测试新配置
    setTimeout(() => {
      fetchRecordCount(collectionName);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 主内容区 */}
      <main className="flex-1 p-8 overflow-auto">
        {/* 顶部导航 */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Records in {collectionName}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage records in selected collection
          </p>
        </div>

        {/* 通知提示 */}
        <Notification type="error" message={error || ''} />
        <Notification type="success" message={success || ''} />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Records Management
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total records: {recordsLoading ? (
                <span className="inline-flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Loading...</span>
                </span>
              ) : recordCount}
            </div>
          </div>

          <div>
            {/* 记录管理内容 */}
            <div className="space-y-6">
              <RecordsTabs
                // Tab state
                activeRecordTab={activeRecordTab}
                setActiveRecordTab={setActiveRecordTab}

                // Add records props
                addingRecords={addingRecords}
                newRecordIds={newRecordIds}
                newRecordEmbeddings={newRecordEmbeddings}
                newRecordMetadatas={newRecordMetadatas}
                newRecordDocuments={newRecordDocuments}
                onNewRecordIdsChange={setNewRecordIds}
                onNewRecordEmbeddingsChange={setNewRecordEmbeddings}
                onNewRecordMetadatasChange={setNewRecordMetadatas}
                onNewRecordDocumentsChange={setNewRecordDocuments}
                onAddRecords={addRecords}

                // Query records props
                queryingRecords={queryingRecords}
                queryText={queryText}
                queryEmbedding={queryEmbedding}
                queryNResults={queryNResults}
                queryWhere={queryWhere}
                onQueryTextChange={setQueryText}
                onQueryEmbeddingChange={setQueryEmbedding}
                onQueryNResultsChange={setQueryNResults}
                onQueryWhereChange={setQueryWhere}
                onQueryRecords={queryRecords}

                // Get records props
                fetchingRecords={fetchingRecords}
                getRecordIds={getRecordIds}
                getRecordLimit={getRecordLimit}
                getRecordWhere={getRecordWhere}
                onGetRecordIdsChange={setGetRecordIds}
                onGetRecordLimitChange={setGetRecordLimit}
                onGetRecordWhereChange={setGetRecordWhere}
                onGetRecords={getRecords}

                // Delete records props
                deletingRecords={deletingRecords}
                deleteRecordIds={deleteRecordIds}
                deleteRecordWhere={deleteRecordWhere}
                onDeleteRecordIdsChange={setDeleteRecordIds}
                onDeleteRecordWhereChange={setDeleteRecordWhere}
                onDeleteRecords={deleteRecords}

                // Update records props
                updatingRecords={updatingRecords}
                updateRecordIds={updateRecordIds}
                updateRecordEmbeddings={updateRecordEmbeddings}
                updateRecordMetadatas={updateRecordMetadatas}
                updateRecordDocuments={updateRecordDocuments}
                onUpdateRecordIdsChange={setUpdateRecordIds}
                onUpdateRecordEmbeddingsChange={setUpdateRecordEmbeddings}
                onUpdateRecordMetadatasChange={setUpdateRecordMetadatas}
                onUpdateRecordDocumentsChange={setUpdateRecordDocuments}
                onUpdateRecords={updateRecords}

                // Upsert records props
                upsertingRecords={upsertingRecords}
                upsertRecordIds={upsertRecordIds}
                upsertRecordEmbeddings={upsertRecordEmbeddings}
                upsertRecordMetadatas={upsertRecordMetadatas}
                upsertRecordDocuments={upsertRecordDocuments}
                onUpsertRecordIdsChange={setUpsertRecordIds}
                onUpsertRecordEmbeddingsChange={setUpsertRecordEmbeddings}
                onUpsertRecordMetadatasChange={setUpsertRecordMetadatas}
                onUpsertRecordDocumentsChange={setUpsertRecordDocuments}
                onUpsertRecords={upsertRecords}

                // Results
                records={records}
              />
            </div>
          </div>
        </div>

        {/* 确认对话框 */}
        <ConfirmationDialog
          isOpen={showDeleteRecordsConfirm}
          onClose={() => setShowDeleteRecordsConfirm(false)}
          onConfirm={handleDeleteRecordsConfirm}
          title="确认删除记录"
          message="确定要删除选定的记录吗？"
          confirmText="删除"
          cancelText="取消"
        />
        <ConfirmationDialog
          isOpen={showUpdateRecordsConfirm}
          onClose={() => setShowUpdateRecordsConfirm(false)}
          onConfirm={handleUpdateRecordsConfirm}
          title="确认更新记录"
          message="确定要更新选定的记录吗？"
          confirmText="更新"
          cancelText="取消"
        />
        <ConfirmationDialog
          isOpen={showUpsertRecordsConfirm}
          onClose={() => setShowUpsertRecordsConfirm(false)}
          onConfirm={handleUpsertRecordsConfirm}
          title="确认插入更新记录"
          message="确定要插入或更新选定的记录吗？"
          confirmText="插入/更新"
          cancelText="取消"
        />

        {/* 设置模态框 */}
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={handleSettingsSaved}
        />
      </main>
    </div>
  );
}
