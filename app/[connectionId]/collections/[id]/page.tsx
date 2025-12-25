"use client";

import { useState, useEffect } from "react";
import { chromaService } from "@/app/utils/chroma-service";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import type { GetResult, QueryResult, Metadata } from "chromadb";
import { useRouter, useParams } from "next/navigation";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Icon } from "@iconify/react";
import CollectionDetailQuery from "./query";
import { useCollectionsContext } from "../layout";
import CollectionForm from "@/components/CollectionForm";

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
	const [selectedRecordIndex, setSelectedRecordIndex] = useState<number | null>(
		null
	);
	const [currentPage, setCurrentPage] = useState(1);
	const [collectionMetadata, setCollectionMetadata] = useState<Record<
		string,
		unknown
	> | null>(null);
	const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
	const [copied, setCopied] = useState(false);
	const { connectionId } = useParams<{ connectionId: string }>();
	const router = useRouter();
	const { refreshCollections } = useCollectionsContext();

	// 获取记录状态
	const [fetchingRecords, setFetchingRecords] = useState(false);
	const [getRecordIds, setGetRecordIds] = useState("");
	const [getRecordWhere, setGetRecordWhere] = useState("");
	const [getRecordLimit, setGetRecordLimit] = useState("10");

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
	const getRecords = async (page = currentPage, limitStr = getRecordLimit) => {
		try {
			setFetchingRecords(true);
			setError(null);
			setLoading(true);

			// 准备参数
			const params: {
				ids?: string[];
				where?: import("chromadb").Where;
				limit?: number;
				offset?: number;
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
				const limit = parseInt(limitStr) || 10;
				params.limit = limit;
				params.offset = (page - 1) * limit;
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
			setCurrentPage(1);
			getRecords();
			// load collection metadata
			chromaService
				.listCollections()
				.then((cols) => {
					const found = (
						cols as Array<{ name: string; metadata?: Record<string, unknown> }>
					).find((c) => c.name === collectionName);
					setCollectionMetadata(found?.metadata ?? null);
				})
				.catch(() => {});
		}
	}, [collectionName]);

	return (
		<div className="w-full h-full flex flex-col p-4 space-y-4">
			<div className="flex items-center gap-2 group shrink-0">
				<Icon
					icon="heroicons:rectangle-stack"
					className="w-5 h-5 text-slate-500"
				/>
				<h3 className="text-base font-semibold">{collectionName}</h3>
				<button
					type="button"
					aria-label="Copy collection name"
					title="复制集合名称"
					onClick={async () => {
						try {
							await navigator.clipboard.writeText(collectionName);
							setCopied(true);
							setTimeout(() => setCopied(false), 1200);
						} catch {}
					}}
					className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
				>
					<Icon
						icon={copied ? "heroicons:check" : "heroicons:clipboard-document"}
						className={`w-4 h-4 ${
							copied
								? "text-green-600"
								: "text-slate-400 group-hover:text-slate-600"
						}`}
					/>
				</button>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full flex-1 flex flex-col overflow-hidden min-h-0"
			>
				<TabsList className="shrink-0">
					<TabsTrigger value="view">View</TabsTrigger>
					<TabsTrigger value="query">Query</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</TabsList>
				<TabsContent
					value="view"
					className="flex-1 overflow-hidden data-[state=active]:flex flex-col mt-2"
				>
					{error ? (
						<div className="text-red-500 mb-4">{error}</div>
					) : (
						<div className="w-full overflow-hidden rounded-md relative flex flex-col flex-1 min-h-0">
              {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center backdrop-blur-[1px]">
                  <LoadingSpinner />
                </div>
              )}
							<Table
								containerClassName="overflow-auto min-h-0"
								className="w-full [&_td]:border-r [&_th]:border-r [&_td:last-child]:border-r-0 [&_th:last-child]:border-r-0"
							>
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
							<div className="flex items-center justify-between mt-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
								<div className="flex items-center gap-4 text-sm text-muted-foreground">
									<div className="flex items-center gap-2 font-medium">
										<Icon icon="heroicons:circle-stack" className="w-4 h-4" />
										<span>Total {recordCount} records</span>
									</div>
								</div>
								<div className="flex items-center gap-6 lg:gap-8">
									<div className="flex items-center space-x-2">
										<span className="text-sm text-muted-foreground">
											Rows per page
										</span>
										<select
											className="h-8 w-[70px] rounded-md border border-input bg-background px-2 py-1 text-xs font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
											value={getRecordLimit}
											onChange={(e) => {
												const newLimit = e.target.value;
												setGetRecordLimit(newLimit);
												setCurrentPage(1);
												getRecords(1, newLimit);
											}}
										>
											<option value="10">10</option>
											<option value="20">20</option>
											<option value="50">50</option>
											<option value="100">100</option>
										</select>
									</div>
									<div className="flex items-center space-x-2">
										<Button
											variant="outline"
											size="icon-sm"
											disabled={currentPage <= 1 || loading}
											onClick={() => {
												const next = Math.max(1, currentPage - 1);
												setCurrentPage(next);
												getRecords(next);
											}}
										>
											<Icon icon="heroicons:chevron-left" className="h-4 w-4" />
											<span className="sr-only">Previous page</span>
										</Button>
										<div className="flex px-2 items-center justify-center text-sm font-medium">
											{currentPage}
										</div>
										<Button
											variant="outline"
											size="icon-sm"
											disabled={
												currentPage >=
													Math.max(
														1,
														Math.ceil(
															(recordCount || 0) /
																(parseInt(getRecordLimit) || 10)
														)
													) || loading
											}
											onClick={() => {
												const total = Math.max(
													1,
													Math.ceil(
														(recordCount || 0) /
															(parseInt(getRecordLimit) || 10)
													)
												);
												const next = Math.min(total, currentPage + 1);
												setCurrentPage(next);
												getRecords(next);
											}}
										>
											<Icon
												icon="heroicons:chevron-right"
												className="h-4 w-4"
											/>
											<span className="sr-only">Next page</span>
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}
				</TabsContent>
				<TabsContent
					value="query"
					className="flex-1 overflow-auto data-[state=active]:block mt-2"
				>
					{/* 搜索 */}
					<CollectionDetailQuery params={routeParams} />
				</TabsContent>
				<TabsContent
					value="settings"
					className="flex-1 overflow-auto data-[state=active]:block mt-2 p-2"
				>
					<div className="max-w-2xl">
						<CollectionForm
							initialName={collectionName}
							initialMetadata={collectionMetadata ?? undefined}
							allowEditName
							submitting={isUpdatingSettings}
							onSubmit={async ({ name, metadata }) => {
								try {
									setIsUpdatingSettings(true);
									const payload: {
										newName?: string;
										metadata?: Record<string, unknown>;
									} = {};
									if (name && name !== collectionName) {
										payload.newName = name;
									}
									if (metadata) {
										payload.metadata = metadata;
									}
									await chromaService.updateCollection(collectionName, payload);
									if (payload.newName) {
										setCollectionName(payload.newName);
										if (connectionId) {
											const url = `/${connectionId}/collections/${payload.newName}`;
											// 路由到新的集合详情
											router.replace(url);
										}
									}
									setCollectionMetadata(
										(payload.metadata as Record<string, unknown> | null) ??
											collectionMetadata
									);
									// 刷新左侧集合列表
									await refreshCollections();
									setSuccess("集合设置已更新");
								} catch (err) {
									const errorMessage = (err as Error).message;
									if (errorMessage.includes("hnsw:space")) {
										setError(
											"不支持修改距离度量（hnsw:space）。如需更改，请克隆新集合。"
										);
									} else {
										setError("更新集合失败: " + errorMessage);
									}
								} finally {
									setIsUpdatingSettings(false);
								}
							}}
						/>
					</div>
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
									<Icon
										icon="heroicons:document-text"
										className="w-6 h-6 text-slate-500"
									/>
									Record Details
								</SheetTitle>
								<SheetDescription>
									Full details for record ID:{" "}
									<span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-900 dark:text-slate-100">
										{Array.isArray(records.ids[selectedRecordIndex])
											? (records.ids[selectedRecordIndex] as string[]).join(
													", "
											  )
											: (records.ids[selectedRecordIndex] as string)}
									</span>
								</SheetDescription>
							</SheetHeader>

							<div className="flex-1 overflow-y-auto p-6 space-y-8">
								{/* Document Section */}
								<section className="space-y-3">
									<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
										<Icon
											icon="heroicons:bars-3-bottom-left"
											className="w-4 h-4"
										/>
										Document Content
									</h3>
									<div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words min-h-[100px]">
										{records.documents?.[selectedRecordIndex] || (
											<span className="text-slate-400 italic">
												No document content
											</span>
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
											{Object.entries(
												records.metadatas[selectedRecordIndex] as Record<
													string,
													string | number | boolean
												>
											).map(([key, value]) => (
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
											))}
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
												Dimension:{" "}
												{records.embeddings[selectedRecordIndex].length}
											</span>
										)}
									</div>
									<div className="bg-slate-950 text-slate-300 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
										{records.embeddings?.[selectedRecordIndex] ? (
											<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
												{(
													records.embeddings[selectedRecordIndex] as (
														| number
														| number[]
													)[]
												).map((val, i) => (
													<span
														key={i}
														className="hover:text-white transition-colors"
													>
														{Array.isArray(val)
															? `[${val.slice(0, 2).join(", ")}...]`
															: (val as number)?.toFixed?.(4) ?? val}
													</span>
												))}
											</div>
										) : (
											<span className="text-slate-600 italic">
												No embeddings available
											</span>
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
