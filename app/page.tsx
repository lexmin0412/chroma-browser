"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConnectionList from "@/components/ConnectionList";
import ConnectionFormDrawer from "@/components/ConnectionFormDrawer";
import {
	IConnectionItem,
	IConnectionFlatItem,
	IChromaNormalConnectionFlatItem,
	IChromaCloudConnectionFlatItem,
	IWeaviateCloudConnectionFlatItem
} from "@/types";
import { chromaService } from "@/app/utils/chroma-service";
import Image from "next/image";

export default function Home() {
	const router = useRouter();
	const [connections, setConnections] = useState<IConnectionItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingConnection, setEditingConnection] = useState<IConnectionItem | null>(null);
	const [editingFormData, setEditingFormData] = useState<Partial<IConnectionFlatItem>>();

	const fetchConnections = async () => {
		try {
			setIsLoading(true);
			const response = await fetch("/api/connections");
			if (!response.ok) throw new Error("Failed to fetch connections");
			const data = await response.json();
			setConnections(data);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchConnections();
	}, []);

	const handleLaunch = (connection: IConnectionItem) => {
		chromaService.setCurrentConnection(connection.id);
		router.push(`/${connection.id}/collections`);
	};

	const handleAddConnection = () => {
		setEditingConnection(null);
		setEditingFormData({ type: "ChromaNormal" });
		setIsFormOpen(true);
	};

	const handleEditConnection = (connection: IConnectionItem) => {
		setEditingConnection(connection);
		let flatData: Partial<IConnectionFlatItem> = {
			name: connection.name,
			type: connection.type,
			description: connection.description,
		};

		if (connection.type === "ChromaNormal") {
			flatData = {
				...flatData,
				host: connection.config.host,
				port: connection.config.port,
			};
		} else if (connection.type === "ChromaCloud") {
			flatData = {
				...flatData,
				apiKey: connection.config.apiKey,
				tenant: connection.config.tenant,
				database: connection.config.database,
			};
		} else if (connection.type === "WeaviateCloud") {
			flatData = {
				...flatData,
				weaviateURL: connection.config.weaviateURL,
				weaviateApiKey: connection.config.weaviateApiKey,
			};
		}

		setEditingFormData(flatData);
		setIsFormOpen(true);
	};

	const handleDeleteConnection = async (id: number) => {
		if (confirm("Are you sure you want to delete this connection?")) {
			try {
				const response = await fetch(`/api/connections?id=${id}`, {
					method: "DELETE",
				});
				if (response.ok) {
					fetchConnections();
				}
			} catch (err) {
				console.error(err);
			}
		}
	};

	const handleFormSubmit = async (formData: Omit<IConnectionFlatItem, "id">) => {
		try {
			const config = {};
			if (formData.type === "ChromaNormal") {
				const normal = formData as unknown as Omit<IChromaNormalConnectionFlatItem, "id">;
				Object.assign(config, { host: normal.host, port: normal.port });
			} else if (formData.type === "ChromaCloud") {
				const cloud = formData as unknown as Omit<IChromaCloudConnectionFlatItem, "id">;
				Object.assign(config, {
					apiKey: cloud.apiKey,
					tenant: cloud.tenant,
					database: cloud.database,
				});
			} else if (formData.type === "WeaviateCloud") {
				const weaviate = formData as unknown as Omit<IWeaviateCloudConnectionFlatItem, "id">;
				Object.assign(config, {
					weaviateURL: weaviate.weaviateURL,
					weaviateApiKey: weaviate.weaviateApiKey,
				});
			}

			const connectionData = {
				name: formData.name,
				type: formData.type,
				description: formData.description,
				config,
			};

			let response;
			if (editingConnection) {
				response = await fetch(`/api/connections?id=${editingConnection.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(connectionData),
				});
			} else {
				response = await fetch("/api/connections", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(connectionData),
				});
			}

			if (!response.ok) throw new Error("Failed to save");

			await fetchConnections();
			setIsFormOpen(false);
		} catch (err) {
			console.error(err);
			alert("Failed to save connection");
		}
	};

	return (
		<div className="container mx-auto px-4 py-8 mt-16 max-w-6xl">
			<div className="text-center space-y-4 mb-12">
				<div className="text-6xl mb-4 flex justify-center">
					<Image
						src="/vector-icon.svg"
						alt="Vector Icon"
						width={96}
						height={96}
						className="text-slate-900 dark:text-white"
					/>
				</div>
				<h1 className="text-4xl font-bold text-foreground">
					Vector DB Browser
				</h1>
				<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
					A modern, open-source browser interface for your Vector Databases.
					Connect, explore, and manage your vector collections with ease.
				</p>
			</div>

			{isLoading ? (
				<div className="flex justify-center p-12">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : (
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-semibold tracking-tight">Your Connections</h2>
						<Button onClick={handleAddConnection} size="lg" className="gap-2">
							<Plus className="h-5 w-5" />
							New Connection
						</Button>
					</div>

					<ConnectionList
						connections={connections}
						onLaunch={handleLaunch}
						onEdit={handleEditConnection}
						onDelete={handleDeleteConnection}
					/>
				</div>
			)}

			<ConnectionFormDrawer
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				initialData={editingFormData}
				onSubmit={handleFormSubmit}
			/>
		</div>
	);
}
