"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
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
	const [collectionName, setCollectionName] = useState("");
	const [activeTab, setActiveTab] = useState("view");
	const [recordCount, setRecordCount] = useState(0);
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

	const [filters, setFilters] = useState({
		ids: "",
		limit: "10",
		offset: "0",
		where: "",
		whereDocument: "",
	});

	// CRUD States
	const [operating, setOperating] = useState(false);
	const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
	const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
	const [recordForm, setRecordForm] = useState({
		id: "",
		document: "",
		metadata: "{}",
		embedding: "",
	});

	// 初始化集合名称
	useEffect(() => {
		const init = async () => {
			const routeParamsObj = await routeParams;
			setCollectionName(routeParamsObj.id);
		};
		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [routeParams]);

	// 清空通知

	// 获取集合记录数量
	const fetchRecordCount = useCallback(
		async (name: string = collectionName) => {
			try {
				const count = await chromaService.countRecords(name);
				setRecordCount(count);
			} catch (err) {
				console.error("Failed to fetch record count:", err);
			}
		},
		[collectionName]
	);

	// 获取所有记录
	const getRecords = useCallback(
		async (pageOrOverride?: number | typeof filters) => {
			try {
				setLoading(true);

				let targetFilters = filters;

				// Handle arguments
				if (typeof pageOrOverride === "number") {
					const targetPage = pageOrOverride;
					const limit = parseInt(filters.limit) || 10;
					const offset = (targetPage - 1) * limit;
					targetFilters = { ...filters, offset: offset.toString() };
					// Sync state
					setFilters(targetFilters);
					setCurrentPage(targetPage);
				} else if (pageOrOverride && typeof pageOrOverride === "object") {
					targetFilters = pageOrOverride;
				}

				// 准备参数
				const params: {
					ids?: string[];
					where?: import("chromadb").Where;
					whereDocument?: import("chromadb").WhereDocument;
					limit?: number;
					offset?: number;
					include?: ("embeddings" | "metadatas" | "documents")[];
				} = {};

				// 解析 IDs
				if (targetFilters.ids.trim()) {
					params.ids = targetFilters.ids
						.split(",")
						.map((id) => id.trim())
						.filter(Boolean);
				}

				// 如果没有指定 IDs，则设置分页
				if (!params.ids || params.ids.length === 0) {
					const limit = parseInt(targetFilters.limit) || 10;
					const offset = parseInt(targetFilters.offset) || 0;
					params.limit = limit;
					params.offset = offset;
				}

				// 解析 where 条件
				if (targetFilters.where.trim()) {
					try {
						params.where = JSON.parse(targetFilters.where);
					} catch {
						toast.error("Where condition must be valid JSON");
						return;
					}
				}

				// 解析 whereDocument 条件
				if (targetFilters.whereDocument.trim()) {
					try {
						params.whereDocument = JSON.parse(targetFilters.whereDocument);
					} catch {
						toast.error("WhereDocument condition must be valid JSON");
						return;
					}
				}

				params.include = ["embeddings", "metadatas", "documents"];

				console.log("Fetching records with params:", params);
				const result = await chromaService.getRecords(collectionName, params);
				setRecords(result);
			} catch (err) {
				console.error("Failed to fetch records:", err);
				toast.error("Failed to fetch records: " + (err as Error).message);
			} finally {
				setLoading(false);
			}
		},
		[collectionName, filters]
	);

	// 当集合名称变化时获取记录
	useEffect(() => {
		if (collectionName) {
			const initialFilters = {
				ids: "",
				limit: "10",
				offset: "0",
				where: "",
				whereDocument: "",
			};
			setFilters(initialFilters);
			setCurrentPage(1);
			getRecords(1);
			fetchRecordCount(collectionName);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [collectionName]);

	// CRUD Handlers
	const handleDeleteRecord = async (id: string) => {
		if (!confirm(`Are you sure you want to delete record "${id}"?`)) return;

		try {
			setOperating(true);
			await chromaService.deleteRecords(collectionName, { ids: [id] });
			toast.success(`Record "${id}" deleted successfully.`);
			// Refresh list
			getRecords();
			fetchRecordCount();
		} catch (err) {
			toast.error("Failed to delete record: " + (err as Error).message);
		} finally {
			setOperating(false);
		}
	};

	const handleAddRecord = async () => {
		try {
			setOperating(true);
			const { id, document, metadata, embedding } = recordForm;

			if (!id) throw new Error("ID is required");

			const params: {
				ids: string[];
				documents?: string[];
				metadatas?: Metadata[];
				embeddings?: number[][];
			} = { ids: [id] };

			if (document) params.documents = [document];
			if (metadata && metadata !== "{}") {
				try {
					params.metadatas = [JSON.parse(metadata)];
				} catch {
					throw new Error("Invalid Metadata JSON");
				}
			}
			if (embedding) {
				try {
					params.embeddings = [JSON.parse(embedding)];
				} catch {
					throw new Error("Invalid Embedding JSON");
				}
			}

			await chromaService.addRecords(collectionName, params);
			toast.success(`Record "${id}" added successfully.`);
			setIsAddSheetOpen(false);
			setRecordForm({ id: "", document: "", metadata: "{}", embedding: "" });
			// Refresh list
			getRecords();
			fetchRecordCount();
		} catch (err) {
			toast.error("Failed to add record: " + (err as Error).message);
		} finally {
			setOperating(false);
		}
	};

	const openEditDialog = (index: number) => {
		if (!records || !records.ids) return;

		const idVal = records.ids[index];
		const id = Array.isArray(idVal)
			? idVal.join("-")
			: (idVal as string);

		const docVal = records.documents?.[index];
		const document = Array.isArray(docVal)
			? (docVal[0] || "")
			: (docVal || "");

		const metaVal = records.metadatas?.[index];
		let metadata = "{}";
		if (metaVal) {
			if (Array.isArray(metaVal)) {
				metadata = JSON.stringify(metaVal[0], null, 2);
			} else {
				metadata = JSON.stringify(metaVal, null, 2);
			}
		}

		const embVal = records.embeddings?.[index];
		let embedding = "";
		if (embVal) {
			// Check if it's number[][] (QueryResult) or number[] (GetResult)
			if (Array.isArray(embVal) && embVal.length > 0 && Array.isArray(embVal[0])) {
				embedding = JSON.stringify(embVal[0]);
			} else {
				embedding = JSON.stringify(embVal);
			}
		}

		setRecordForm({ id, document, metadata, embedding });
		setIsEditSheetOpen(true);
	};

	const handleUpdateRecord = async () => {
		try {
			setOperating(true);
			const { id, document, metadata, embedding } = recordForm;

			if (!id) throw new Error("ID is required");

			const params: {
				ids: string[];
				documents?: string[];
				metadatas?: Metadata[];
				embeddings?: number[][];
			} = { ids: [id] };

			if (document) params.documents = [document];
			if (metadata) {
				try {
					params.metadatas = [JSON.parse(metadata)];
				} catch {
					throw new Error("Invalid Metadata JSON");
				}
			}
			if (embedding) {
				try {
					params.embeddings = [JSON.parse(embedding)];
				} catch {
					throw new Error("Invalid Embedding JSON");
				}
			}

			await chromaService.updateRecords(collectionName, params);
			toast.success(`Record "${id}" updated successfully.`);
			setIsEditSheetOpen(false);
			// Refresh list
			getRecords();
		} catch (err) {
			toast.error("Failed to update record: " + (err as Error).message);
		} finally {
			setOperating(false);
		}
	};

	return (
		<div className="w-full h-full flex flex-col p-4 space-y-4">
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full flex-1 flex flex-col overflow-hidden min-h-0"
			>
				<div className="flex items-center justify-between">
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
								icon={
									copied ? "heroicons:check" : "heroicons:clipboard-document"
								}
								className={`w-4 h-4 ${
									copied
										? "text-green-600"
										: "text-slate-400 group-hover:text-slate-600"
								}`}
							/>
						</button>
					</div>
					<TabsList className="shrink-0">
						<TabsTrigger value="view">View</TabsTrigger>
						<TabsTrigger value="query">Query</TabsTrigger>
						<TabsTrigger value="settings">Settings</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent
					value="view"
					className="flex-1 overflow-hidden data-[state=active]:flex flex-col mt-2"
				>
					<div className="bg-white dark:bg-slate-900 p-3 border-b border-slate-200 dark:border-slate-800 mb-2 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-md">
						<div className="space-y-1">
							<Label htmlFor="filter-ids" className="text-xs">IDs</Label>
							<Input
								id="filter-ids"
								placeholder="id1, id2, ..."
								value={filters.ids}
								onChange={(e) => setFilters({ ...filters, ids: e.target.value })}
								onKeyDown={(e) => e.key === "Enter" && getRecords(1)}
								className="h-8 text-sm"
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="filter-where" className="text-xs">Where (JSON)</Label>
							<Input
								id="filter-where"
								placeholder='{"key": "value"}'
								value={filters.where}
								onChange={(e) => setFilters({ ...filters, where: e.target.value })}
								onKeyDown={(e) => e.key === "Enter" && getRecords(1)}
								className="h-8 text-sm"
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="filter-where-doc" className="text-xs">Where Document (JSON)</Label>
							<Input
								id="filter-where-doc"
								placeholder='{"$contains": "text"}'
								value={filters.whereDocument}
								onChange={(e) =>
									setFilters({ ...filters, whereDocument: e.target.value })
								}
								onKeyDown={(e) => e.key === "Enter" && getRecords(1)}
								className="h-8 text-sm"
							/>
						</div>
					</div>

					<div className="w-full overflow-hidden rounded-md relative flex flex-col flex-1 min-h-0">
						{loading && (
							<div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center backdrop-blur-[1px]">
								<LoadingSpinner />
							</div>
						)}
						<div className="flex justify-end mb-2 px-1">
							<Button
								size="sm"
								onClick={() => {
									setRecordForm({
										id: "",
										document: "",
										metadata: "{}",
										embedding: "",
									});
									setIsAddSheetOpen(true);
								}}
							>
								<Icon icon="heroicons:plus" className="w-4 h-4 mr-1" />
								Add Record
							</Button>
						</div>
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
										<TableHead className="w-[100px]">Actions</TableHead>
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
												<TableCell>
													<div
														className="flex items-center gap-2"
														onClick={(e) => e.stopPropagation()}
													>
														<Button
															variant="ghost"
															size="icon-sm"
															onClick={() => openEditDialog(index)}
														>
															<Icon
																icon="heroicons:pencil-square"
																className="w-4 h-4 text-slate-500"
															/>
														</Button>
														<Button
															variant="ghost"
															size="icon-sm"
															className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
															onClick={() => {
																const id = Array.isArray(records.ids[index])
																	? records.ids[index].join("-")
																	: (records.ids[index] as string);
																handleDeleteRecord(id);
															}}
														>
															<Icon icon="heroicons:trash" className="w-4 h-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={5} className="h-24 text-center">
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
											value={filters.limit}
											onChange={(e) => {
												const newLimit = e.target.value;
												setFilters({ ...filters, limit: newLimit });
												setCurrentPage(1);
												getRecords(1);
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
																(parseInt(filters.limit) || 10)
														)
													) || loading
											}
											onClick={() => {
												const total = Math.max(
													1,
													Math.ceil(
														(recordCount || 0) /
															(parseInt(filters.limit) || 10)
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
									toast.success("集合设置已更新");
								} catch (err) {
									const errorMessage = (err as Error).message;
									if (errorMessage.includes("hnsw:space")) {
										toast.error(
											"不支持修改距离度量（hnsw:space）。如需更改，请克隆新集合。"
										);
									} else {
										toast.error("更新集合失败: " + errorMessage);
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

			{/* Add Record Sheet */}
			<Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
				<SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
					<SheetHeader>
						<SheetTitle>Add New Record</SheetTitle>
						<SheetDescription>
							Add a new record to this collection. ID is required.
						</SheetDescription>
					</SheetHeader>
					<div className="grid gap-4 p-4">
						<div className="grid gap-2">
							<Label htmlFor="id">ID</Label>
							<Input
								id="id"
								value={recordForm.id}
								onChange={(e) =>
									setRecordForm({ ...recordForm, id: e.target.value })
								}
								placeholder="Record ID"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="document">Document Content</Label>
							<Textarea
								id="document"
								value={recordForm.document}
								onChange={(e) =>
									setRecordForm({ ...recordForm, document: e.target.value })
								}
								placeholder="Document text content..."
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="metadata">Metadata (JSON)</Label>
							<Textarea
								id="metadata"
								value={recordForm.metadata}
								onChange={(e) =>
									setRecordForm({ ...recordForm, metadata: e.target.value })
								}
								placeholder='{"key": "value"}'
								className="font-mono text-xs"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="embedding">Embedding (JSON Array)</Label>
							<Textarea
								id="embedding"
								value={recordForm.embedding}
								onChange={(e) =>
									setRecordForm({ ...recordForm, embedding: e.target.value })
								}
								placeholder="[0.1, 0.2, ...]"
								className="font-mono text-xs"
							/>
						</div>
					</div>
					<div className="flex justify-end gap-2 mt-4 px-4">
						<Button
							variant="outline"
							onClick={() => setIsAddSheetOpen(false)}
							disabled={operating}
						>
							Cancel
						</Button>
						<Button onClick={handleAddRecord} disabled={operating}>
							{operating && <Spinner className="mr-2 h-4 w-4" />}
							Add Record
						</Button>
					</div>
				</SheetContent>
			</Sheet>

			{/* Edit Record Sheet */}
			<Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
				<SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
					<SheetHeader>
						<SheetTitle>Edit Record</SheetTitle>
						<SheetDescription>
							Update record details. ID cannot be changed here.
						</SheetDescription>
					</SheetHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="edit-id">ID</Label>
							<Input
								id="edit-id"
								value={recordForm.id}
								disabled
								className="bg-slate-100 dark:bg-slate-800"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-document">Document Content</Label>
							<Textarea
								id="edit-document"
								value={recordForm.document}
								onChange={(e) =>
									setRecordForm({ ...recordForm, document: e.target.value })
								}
								placeholder="Document text content..."
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-metadata">Metadata (JSON)</Label>
							<Textarea
								id="edit-metadata"
								value={recordForm.metadata}
								onChange={(e) =>
									setRecordForm({ ...recordForm, metadata: e.target.value })
								}
								placeholder='{"key": "value"}'
								className="font-mono text-xs"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-embedding">Embedding (JSON Array)</Label>
							<Textarea
								id="edit-embedding"
								value={recordForm.embedding}
								onChange={(e) =>
									setRecordForm({ ...recordForm, embedding: e.target.value })
								}
								placeholder="[0.1, 0.2, ...]"
								className="font-mono text-xs"
							/>
						</div>
					</div>
					<div className="flex justify-end gap-2 mt-4">
						<Button
							variant="outline"
							onClick={() => setIsEditSheetOpen(false)}
							disabled={operating}
						>
							Cancel
						</Button>
						<Button onClick={handleUpdateRecord} disabled={operating}>
							{operating && <Spinner className="mr-2 h-4 w-4" />}
							Update Record
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
