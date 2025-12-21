'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from "@/components/ui/empty";
import ConnectionsManager from "@/components/ConnectionsManager";
import { IConnectionItem } from "@/types";
import { chromaService } from "@/app/utils/chroma-service";

export default function HomePage() {
	const router = useRouter();
	const [connections, setConnections] = useState<IConnectionItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isManagerOpen, setIsManagerOpen] = useState(false);

	const fetchConnections = async () => {
		try {
			setIsLoading(true);
			const response = await fetch("/api/connections");
			if (response.ok) {
				const data = await response.json();
				setConnections(data);
			}
		} catch (error) {
			console.error("Failed to fetch connections", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchConnections();
	}, []);

	const handleConnectionClick = (connection: IConnectionItem) => {
		chromaService.setCurrentConnection(connection.id);
		router.push(`/${connection.id}/collections`);
	};

	const handleConnectionSelect = () => {
		fetchConnections();
	}

	return (
		<div className="container mx-auto px-4 py-8 mt-16">
			<div className="text-center space-y-4 mb-12">
				<div className="text-6xl mb-4">🗄️</div>
				<h1 className="text-4xl font-bold text-slate-900 dark:text-white">Vector DB Browser</h1>
			</div>

			{isLoading ? (
				<div className="flex justify-center items-center py-12">
					<Icon icon="heroicons:arrow-path" className="w-8 h-8 animate-spin text-slate-400" />
				</div>
			) : connections.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Icon icon="heroicons:server-stack" className="w-12 h-12 text-slate-400" />
						</EmptyMedia>
						<EmptyTitle>No Connections Found</EmptyTitle>
						<EmptyDescription>
							Configure a connection to your ChromaDB instance to get started.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={() => setIsManagerOpen(true)}>
							<Icon icon="heroicons:plus" className="mr-2 h-4 w-4" />
							Add Connection
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{connections.map((connection) => (
						<Card
							key={connection.id}
							className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 dark:border-slate-800"
							onClick={() => handleConnectionClick(connection)}
						>
							<CardHeader className="pb-2">
								<div className="flex justify-between items-start">
									<CardTitle className="text-xl">{connection.name}</CardTitle>
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${connection.type === "ChromaNormal"
											? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
											: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
										}`}>
										{connection.type.replace("Chroma", "")}
									</span>
								</div>
								<CardDescription className="line-clamp-2 min-h-[2.5rem]">
									{connection.description || "No description provided"}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
									{connection.type === "ChromaNormal" && (
										<>
											<div className="flex items-center gap-2">
												<Icon icon="heroicons:computer-desktop" className="w-4 h-4" />
												<span>{connection.config?.host}:{connection.config?.port}</span>
											</div>
										</>
									)}
									{connection.type === "ChromaCloud" && (
										<>
											<div className="flex items-center gap-2">
												<Icon icon="heroicons:cloud" className="w-4 h-4" />
												<span>{connection.config?.tenant}/{connection.config?.database}</span>
											</div>
										</>
									)}
								</div>
							</CardContent>
							<CardFooter>
								<Button variant="ghost" className="w-full text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
									Connect <Icon icon="heroicons:arrow-right" className="ml-2 w-4 h-4" />
								</Button>
							</CardFooter>
						</Card>
					))}
					{/* Add New Connection Card */}
					<Card
						className="hover:shadow-lg transition-shadow cursor-pointer border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center min-h-[200px]"
						onClick={() => setIsManagerOpen(true)}
					>
						<div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
							<div className="p-3 rounded-full bg-slate-200 dark:bg-slate-800">
								<Icon icon="heroicons:plus" className="w-6 h-6" />
							</div>
							<span className="font-medium">Add New Connection</span>
						</div>
					</Card>
				</div>
			)}

			<ConnectionsManager
				isOpen={isManagerOpen}
				onClose={() => {
					setIsManagerOpen(false);
					fetchConnections();
				}}
				onConnectionSelect={handleConnectionSelect}
			/>
		</div>
	);
}
