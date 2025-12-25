"use client";

import React, { useState, useEffect } from "react";
import { chromaService } from "@/app/utils/chroma-service";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
	Empty,
	EmptyDescription,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarProvider,
} from "@/components/ui/sidebar";
import CollectionForm from "@/components/CollectionForm";

import type { Collection } from "chromadb";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";

const CollectionsContext = React.createContext<{
	refreshCollections: () => Promise<void>;
} | null>(null);
export function useCollectionsContext() {
	const ctx = React.useContext(CollectionsContext);
	if (!ctx)
		throw new Error(
			"useCollectionsContext must be used within CollectionsLayout"
		);
	return ctx;
}

export default function CollectionsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { id: collectionId, connectionId } = useParams<{
		id: string;
		connectionId: string;
	}>();
	const [collections, setCollections] = useState<Collection[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// 创建集合相关状态
	const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
	const [creatingCollection, setCreatingCollection] = useState(false);

	// 确认对话框状态
	const [showDeleteCollectionConfirm, setShowDeleteCollectionConfirm] =
		useState(false);
	const [collectionToDelete, setCollectionToDelete] = useState<string | null>(
		null
	);
	const [deletingCollection, setDeletingCollection] = useState(false);

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
			if (
				errorMessage.includes("fetch") ||
				errorMessage.includes("network") ||
				errorMessage.includes("ECONNREFUSED")
			) {
				setError("无法连接到 Vector DB 服务器，请确保服务器正在运行并可访问。");
			} else {
				setError("获取集合失败: " + errorMessage);
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
		setError(null);
	};

	// 创建集合
	const createCollection = async (payload: {
		name: string;
		metadata?: Record<string, unknown> | null;
	}) => {
		try {
			setCreatingCollection(true);
			setError(null);
			await chromaService.createCollection(
				payload.name,
				(payload.metadata ??
					undefined) as unknown as import("chromadb").CollectionMetadata
			);
			closeCreateDrawer();
			await fetchCollections();
		} catch (err) {
			const errorMessage = (err as Error).message;
			if (
				errorMessage.includes("fetch") ||
				errorMessage.includes("network") ||
				errorMessage.includes("ECONNREFUSED")
			) {
				setError("无法连接到 Vector DB 服务器，请确保服务器正在运行并可访问。");
			} else if (errorMessage.includes("already exists")) {
				setError("集合已存在，请使用不同的名称");
			} else {
				setError("集合创建失败: " + errorMessage);
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
			setDeletingCollection(true);
			setLoading(true);
			setError(null);

			await chromaService.deleteCollection(collectionToDelete);
			setShowDeleteCollectionConfirm(false);
			setCollectionToDelete(null);

		} catch (err) {
			const errorMessage = (err as Error).message;
			// 检查是否是连接错误
			if (
				errorMessage.includes("fetch") ||
				errorMessage.includes("network") ||
				errorMessage.includes("ECONNREFUSED")
			) {
				setError("无法连接到 Vector DB 服务器，请确保服务器正在运行并可访问。");
			} else {
				setError("集合删除失败: " + errorMessage);
			}
		} finally {
			setLoading(false);
			setDeletingCollection(false);
		}

		// 更新集合列表
		await fetchCollections();
	};

	// 初始化时获取集合列表
	useEffect(() => {
		fetchCollections();
	}, []);

	return (
		<CollectionsContext.Provider
			value={{ refreshCollections: fetchCollections }}
		>
			<div className="h-full bg-slate-50 dark:bg-slate-950">
				<SidebarProvider>
					<div className="flex h-full w-full">
						<Sidebar className="hidden md:block md:top-16 md:h-[calc(100vh-4rem)]">
							<SidebarHeader className="p-4 border-b border-slate-200 dark:border-slate-700">
								<div className="flex justify-between items-center">
									<h5 className="text-lg font-semibold text-slate-900 dark:text-white">
										Collections
									</h5>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="icon"
											onClick={fetchCollections}
											disabled={loading}
											className="h-8 w-8"
											title="Refresh collections"
										>
											{loading ? (
												<Spinner className="h-4 w-4" />
											) : (
												<Icon icon="material-symbols:refresh" />
											)}
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
										const isSelected = collectionId === collection.name;
										const metadata = collection.metadata as
											| Record<string, unknown>
											| undefined;
										const hasMetadata =
											metadata && Object.keys(metadata).length > 0;
										const description =
											typeof metadata?.["description"] === "string"
												? metadata["description"]
												: null;

										return (
											<div key={collection.id} className="group">
												<Link
													href={`/${connectionId}/collections/${collection.name}`}
													className={`flex items-center justify-between p-2 rounded-r-lg text-slate-900 dark:text-white transition-all ${
														isSelected
															? "bg-indigo-100 dark:bg-indigo-900/30 border-l-4 border-indigo-500 dark:border-indigo-400"
															: "hover:bg-slate-100 dark:hover:bg-slate-700"
													}`}
												>
													<div className="flex flex-col overflow-hidden flex-1 mr-2">
														<div className="flex items-center gap-1.5">
															<span
																className={`font-medium text-sm truncate ${
																	isSelected
																		? "text-indigo-700 dark:text-indigo-300"
																		: ""
																}`}
															>
																{collection.name}
															</span>
															{hasMetadata && (
																<Tooltip>
																	<TooltipTrigger asChild>
																		<div
																			role="button"
																			className="opacity-60 hover:opacity-100 transition-opacity cursor-help"
																			onClick={(e) => e.preventDefault()}
																		>
																			<Icon
																				icon="heroicons:information-circle"
																				className="w-4 h-4"
																			/>
																		</div>
																	</TooltipTrigger>
																	<TooltipContent
																		side="right"
																		className="max-w-[320px] p-3 z-50"
																	>
																		<div className="space-y-2">
																			<div className="font-semibold text-xs border-b pb-1 mb-1 opacity-90">
																				Metadata Details
																			</div>
																			<div className="grid gap-2 max-h-[300px] overflow-y-auto">
																				{Object.entries(metadata).map(
																					([key, value]) => (
																						<div
																							key={key}
																							className="text-xs flex flex-col gap-0.5"
																						>
																							<span className="font-mono font-bold opacity-70">
																								{key}
																							</span>
																							<span className="font-mono break-all opacity-90 whitespace-pre-wrap">
																								{typeof value === "object"
																									? JSON.stringify(value)
																									: String(value)}
																							</span>
																						</div>
																					)
																				)}
																			</div>
																		</div>
																	</TooltipContent>
																</Tooltip>
															)}
														</div>
														{description && (
															<span
																className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 block"
																title={description}
															>
																{description}
															</span>
														)}
													</div>
													<Button
														variant="ghost"
														size="icon"
														className="opacity-0 group-hover:opacity-100 h-6 w-6 p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 shrink-0"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															deleteCollection(collection.name);
														}}
														title="Delete collection"
													>
														<Icon icon="heroicons:trash" className="w-4 h-4" />
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
							<Dialog
								open={isCreateDrawerOpen}
								onOpenChange={(open) => !open && closeCreateDrawer()}
							>
								<DialogContent className="sm:max-w-[425px]">
									<DialogHeader>
										<DialogTitle>Create New Collection</DialogTitle>
									</DialogHeader>
									<div className="space-y-5">
										{error && (
											<Alert variant="destructive">
												<AlertDescription>{error}</AlertDescription>
											</Alert>
										)}
										<CollectionForm
											initialName=""
											initialMetadata={undefined}
											allowEditName
											submitting={creatingCollection}
											onSubmit={(data) => createCollection(data)}
											onCancel={closeCreateDrawer}
										/>
									</div>
									<DialogFooter />
								</DialogContent>
							</Dialog>

							{/* 确认对话框 */}
							<Dialog
								open={showDeleteCollectionConfirm}
								onOpenChange={(open) =>
									!open && setShowDeleteCollectionConfirm(false)
								}
							>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Confirm Delete Collection</DialogTitle>
									</DialogHeader>
									<div className="py-4">
										<p className="text-sm text-slate-600 dark:text-slate-400">
											{`Are you sure you want to delete the collection "${collectionToDelete}"?`}
										</p>
									</div>
									<DialogFooter>
										<Button
											variant="outline"
											disabled={deletingCollection}
											onClick={() => {
												setShowDeleteCollectionConfirm(false);
												setCollectionToDelete(null);
											}}
										>
											Cancel
										</Button>
										<Button
											variant="destructive"
											disabled={deletingCollection}
											onClick={handleDeleteCollectionConfirm}
											className="cursor-pointer"
										>
											{deletingCollection ? (
												<>
													<Spinner className="h-4 w-4 mr-2" />
													Deleting...
												</>
											) : (
												"Delete"
											)}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</main>
					</div>
				</SidebarProvider>
			</div>
		</CollectionsContext.Provider>
	);
}
