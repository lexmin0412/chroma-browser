"use client";

import React, { useState, useEffect } from "react";
import { chromaService } from "../../utils/chroma-service";
import LoadingSpinner from "../../components/LoadingSpinner";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import SettingsModal from "../../components/SettingsModal";
import ConfigManager from "../../utils/config-manager";
import type { GetResult, QueryResult, Metadata } from "chromadb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CollectionDetailQuery from "./query";

export default function CollectionDetailPage({
	params: routeParams,
}: {
	params: { id: string };
}) {
	const [records, setRecords] = useState<
		GetResult<Metadata> | QueryResult<Metadata> | null
	>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [collectionName, setCollectionName] = useState("");
	const [activeTab, setActiveTab] = useState("view");
	const [recordCount, setRecordCount] = useState(0);
	const [recordsLoading, setRecordsLoading] = useState(false);

	// 设置相关状态
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

	// 记录管理相关状态
	const [activeRecordTab, setActiveRecordTab] = useState("add");

	// 添加记录状态
	const [addingRecords, setAddingRecords] = useState(false);
	const [newRecordIds, setNewRecordIds] = useState("");
	const [newRecordEmbeddings, setNewRecordEmbeddings] = useState("");
	const [newRecordMetadatas, setNewRecordMetadatas] = useState("");
	const [newRecordDocuments, setNewRecordDocuments] = useState("");

	// 查询记录状态
	const [queryingRecords, setQueryingRecords] = useState(false);
	const [queryText, setQueryText] = useState("");
	const [queryEmbedding, setQueryEmbedding] = useState("");
	const [queryNResults, setQueryNResults] = useState("5");
	const [queryWhere, setQueryWhere] = useState("");

	// 获取记录状态
	const [fetchingRecords, setFetchingRecords] = useState(false);
	const [getRecordIds, setGetRecordIds] = useState("");
	const [getRecordWhere, setGetRecordWhere] = useState("");
	const [getRecordLimit, setGetRecordLimit] = useState("10");

	// 删除记录状态
	const [deletingRecords, setDeletingRecords] = useState(false);
	const [deleteRecordIds, setDeleteRecordIds] = useState("");
	const [deleteRecordWhere, setDeleteRecordWhere] = useState("");

	// 更新记录状态
	const [updatingRecords, setUpdatingRecords] = useState(false);
	const [updateRecordIds, setUpdateRecordIds] = useState("");
	const [updateRecordEmbeddings, setUpdateRecordEmbeddings] = useState("");
	const [updateRecordMetadatas, setUpdateRecordMetadatas] = useState("");
	const [updateRecordDocuments, setUpdateRecordDocuments] = useState("");

	// 插入更新记录状态
	const [upsertingRecords, setUpsertingRecords] = useState(false);
	const [upsertRecordIds, setUpsertRecordIds] = useState("");
	const [upsertRecordEmbeddings, setUpsertRecordEmbeddings] = useState("");
	const [upsertRecordMetadatas, setUpsertRecordMetadatas] = useState("");
	const [upsertRecordDocuments, setUpsertRecordDocuments] = useState("");

	// 确认对话框状态
	const [showDeleteRecordsConfirm, setShowDeleteRecordsConfirm] =
		useState(false);
	const [showUpdateRecordsConfirm, setShowUpdateRecordsConfirm] =
		useState(false);
	const [showUpsertRecordsConfirm, setShowUpsertRecordsConfirm] =
		useState(false);
	const [deleteParams, setDeleteParams] = useState<{
		ids?: string[];
		where?: Metadata;
	} | null>(null);
	const [updateParams, setUpdateParams] = useState<{
		ids: string[];
		embeddings?: number[][];
		metadatas?: Metadata[];
		documents?: string[];
	} | null>(null);
	const [upsertParams, setUpsertParams] = useState<{
		ids: string[];
		embeddings?: number[][];
		metadatas?: Metadata[];
		documents?: string[];
	} | null>(null);

	// 初始化集合名称
	useEffect(() => {
		const init = async () => {
			const routeParamsObj = await routeParams;
			setCollectionName(routeParamsObj.id);
			fetchRecordCount(routeParamsObj.id);
		};
		init();
	}, [routeParams]);

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
			console.error("Failed to fetch record count:", err);
		} finally {
			setRecordsLoading(false);
		}
	};

	// 获取所有记录
	const getRecords = async () => {
		try {
			setFetchingRecords(true);
			setError(null);
			setLoading(true);

			// 准备参数
			const params: {
				ids?: string[];
				where?: import("chromadb").Where;
				limit?: number;
				include?: ("embeddings" | "metadatas" | "documents")[];
			} = {};

			// 解析 IDs
			if (getRecordIds.trim()) {
				params.ids = getRecordIds
					.split(",")
					.map((id) => id.trim())
					.filter(Boolean);

				// 验证 IDs 格式
				for (const id of params.ids) {
					if (!/^[a-zA-Z0-9\-_]+$/.test(id)) {
						throw new Error(
							`ID "${id}" 包含无效字符，只能包含字母、数字、连字符(-)和下划线(_)`
						);
					}
				}
			} else {
				// 如果没有指定 IDs，则设置默认限制
				params.limit = parseInt(getRecordLimit) || 10;
			}

			// 解析 where 条件
			if (getRecordWhere.trim()) {
				try {
					params.where = JSON.parse(getRecordWhere);

					// 验证 where 条件是否为对象
					if (
						typeof params.where !== "object" ||
						Array.isArray(params.where) ||
						params.where === null
					) {
						throw new Error("Where 条件必须是一个有效的 JSON 对象");
					}
				} catch (parseError) {
					if (parseError instanceof SyntaxError) {
						throw new Error("Where 条件 JSON 格式无效: " + parseError.message);
					}
					throw parseError;
				}
			}

			params.include = ["embeddings", "metadatas", "documents"];

			// 执行查询
			const results = await chromaService.getRecords(collectionName, params);
			setRecords(results);

			setSuccess("记录获取成功");
		} catch (err) {
			const errorMessage = (err as Error).message;
			// 检查是否是连接错误
			if (
				errorMessage.includes("fetch") ||
				errorMessage.includes("network") ||
				errorMessage.includes("ECONNREFUSED")
			) {
				setError("无法连接到 Chroma DB 服务器，请确保服务器正在运行并可访问。");
			} else {
				setError("记录获取失败: " + errorMessage);
			}
		} finally {
			setFetchingRecords(false);
			setLoading(false);
		}
	};

	// 当集合名称变化时获取记录
	useEffect(() => {
		if (collectionName) {
			getRecords();
		}
	}, [collectionName]);

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Collection {collectionName}</h1>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList>
					<TabsTrigger value="view">View</TabsTrigger>
					<TabsTrigger value="query">Query</TabsTrigger>
				</TabsList>
				<TabsContent value="view">
					{loading ? (
						<LoadingSpinner />
					) : error ? (
						<div className="text-red-500 mb-4">{error}</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Document</TableHead>
										<TableHead>Metadata</TableHead>
										<TableHead>Embeddings</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{records && records.ids && records.ids.length > 0 ? (
										records.ids.map((id, index) => (
											<TableRow key={id}>
												<TableCell className="font-medium">{id}</TableCell>
												<TableCell>
													{records.documents && records.documents[index] ? (
														<div className="max-w-xs truncate">
															{records.documents[index]}
														</div>
													) : (
														<span className="text-muted-foreground">-</span>
													)}
												</TableCell>
												<TableCell>
													{records.metadatas && records.metadatas[index] ? (
														<div className="max-w-xs truncate">
															{JSON.stringify(records.metadatas[index])}
														</div>
													) : (
														<span className="text-muted-foreground">-</span>
													)}
												</TableCell>
												<TableCell>
													{records.embeddings && records.embeddings[index] ? (
														<div className="max-w-xs truncate">
															[
															{records.embeddings[index].slice(0, 3).join(", ")}
															...]
														</div>
													) : (
														<span className="text-muted-foreground">-</span>
													)}
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={4} className="h-24 text-center">
												No records found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					)}
				</TabsContent>
				<TabsContent value="query">
					{/* 这里将集成 page copy.tsx 中的内容 */}
					<CollectionDetailQuery params={routeParams} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
