"use client";

import React, { useState, useEffect } from "react";
import { chromaService } from "@/app/utils/chroma-service";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";
import SettingsModal from "@/app/components/SettingsModal";
import ConfigManager from "@/app/utils/config-manager";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Icon } from "@iconify/react";
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
	const [selectedRecordIndex, setSelectedRecordIndex] = useState<number | null>(null);

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
		<div className="w-full h-full flex flex-col p-4 space-y-4">
			<h1 className="text-2xl font-bold shrink-0">Collection {collectionName}</h1>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden min-h-0">
				<TabsList className="shrink-0">
					<TabsTrigger value="view">View</TabsTrigger>
					<TabsTrigger value="query">Query</TabsTrigger>
				</TabsList>
				<TabsContent value="view" className="flex-1 overflow-hidden data-[state=active]:flex mt-2">
					{loading ? (
						<LoadingSpinner />
					) : error ? (
						<div className="text-red-500 mb-4">{error}</div>
					) : (
						<div className="w-full overflow-hidden rounded-md relative">
							<Table className="w-full overflow-hidden [&_td]:border-r [&_th]:border-r [&_td:last-child]:border-r-0 [&_th:last-child]:border-r-0">
								<TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 shadow-sm">
									<TableRow className="hover:bg-transparent">
										<TableHead>ID</TableHead>
										<TableHead>Document</TableHead>
										<TableHead>Metadata</TableHead>
										<TableHead>Embeddings</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{records && records.ids && records.ids.length > 0 ? (
										records.ids.map((id, index) => (
											<TableRow
												key={Array.isArray(id) ? id.join("-") : id}
												className="cursor-pointer transition-colors group even:bg-slate-50 dark:even:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/60"
												onClick={() => setSelectedRecordIndex(index)}
											>
												<TableCell className="font-medium">
													<div className="flex items-center gap-2">
														{Array.isArray(id) ? id.join(", ") : id}
														<Icon
															icon="heroicons:chevron-right"
															className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1"
														/>
													</div>
												</TableCell>
												<TableCell>
													{records.documents && records.documents[index] ? (
														<div className="max-w-xs truncate text-slate-600 dark:text-slate-400">
															{records.documents[index]}
														</div>
													) : (
														<span className="text-muted-foreground">-</span>
													)}
												</TableCell>
												<TableCell>
													{records.metadatas && records.metadatas[index] ? (
														<div className="truncate max-w-[200px] text-sm text-slate-600 dark:text-slate-400 font-mono">
															{JSON.stringify(records.metadatas[index])}
														</div>
													) : (
														<span className="text-muted-foreground">-</span>
													)}
												</TableCell>
												<TableCell>
													{records.embeddings && records.embeddings[index] ? (
														<div className="max-w-xs truncate text-slate-600 dark:text-slate-400">
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
				<TabsContent value="query" className="flex-1 overflow-auto data-[state=active]:block mt-2">
					{/* 搜索 */}
					<CollectionDetailQuery params={routeParams} />
				</TabsContent>
			</Tabs>

			{/* Record Detail Sheet */}
			<Sheet
				open={selectedRecordIndex !== null}
				onOpenChange={(open) => !open && setSelectedRecordIndex(null)}
			>
				<SheetContent className="sm:max-w-2xl flex flex-col h-full overflow-hidden p-0">
					{selectedRecordIndex !== null && records && (
						<>
							<SheetHeader className="p-6 border-b bg-slate-50/50 dark:bg-slate-900/50">
								<SheetTitle className="flex items-center gap-2 text-xl">
									<Icon icon="heroicons:document-text" className="w-6 h-6 text-slate-500" />
									Record Details
								</SheetTitle>
								<SheetDescription>
									Full details for record ID:{" "}
									<span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-900 dark:text-slate-100">
										{Array.isArray(records.ids[selectedRecordIndex])
											? (records.ids[selectedRecordIndex] as string[]).join(", ")
											: (records.ids[selectedRecordIndex] as string)}
									</span>
								</SheetDescription>
							</SheetHeader>

							<div className="flex-1 overflow-y-auto p-6 space-y-8">
								{/* Document Section */}
								<section className="space-y-3">
									<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
										<Icon icon="heroicons:bars-3-bottom-left" className="w-4 h-4" />
										Document Content
									</h3>
									<div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words min-h-[100px]">
										{records.documents?.[selectedRecordIndex] || (
											<span className="text-slate-400 italic">No document content</span>
										)}
									</div>
								</section>

								{/* Metadata Section */}
								<section className="space-y-3">
									<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
										<Icon icon="heroicons:tag" className="w-4 h-4" />
										Metadata Fields
									</h3>
									{records.metadatas?.[selectedRecordIndex] ? (
										<div className="grid grid-cols-1 gap-2">
											{Object.entries(records.metadatas[selectedRecordIndex] as Record<string, string | number | boolean>).map(
												([key, value]) => (
													<div
														key={key}
														className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
													>
														<span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider sm:w-1/3 shrink-0">
															{key}
														</span>
														<span className="text-sm text-slate-700 dark:text-slate-300 break-all font-mono">
															{typeof value === "object"
																? JSON.stringify(value)
																: String(value)}
														</span>
													</div>
												)
											)}
										</div>
									) : (
										<div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-sm text-slate-400 italic">
											No metadata available
										</div>
									)}
								</section>

								{/* Embeddings Section */}
								<section className="space-y-3">
									<div className="flex items-center justify-between">
										<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
											<Icon icon="heroicons:variable" className="w-4 h-4" />
											Embeddings
										</h3>
										{records.embeddings?.[selectedRecordIndex] && (
											<span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
												Dimension: {records.embeddings[selectedRecordIndex].length}
											</span>
										)}
									</div>
									<div className="bg-slate-950 text-slate-300 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
										{records.embeddings?.[selectedRecordIndex] ? (
											<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
												{(records.embeddings[selectedRecordIndex] as (number | number[])[]).map((val, i) => (
													<span key={i} className="hover:text-white transition-colors">
														{Array.isArray(val)
															? `[${val.slice(0, 2).join(", ")}...]`
															: (val as number)?.toFixed?.(4) ?? val}
													</span>
												))}
											</div>
										) : (
											<span className="text-slate-600 italic">No embeddings available</span>
										)}
									</div>
								</section>
							</div>

							<div className="p-4 border-t bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
								<button
									onClick={() => setSelectedRecordIndex(null)}
									className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
								>
									Close
								</button>
							</div>
						</>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
