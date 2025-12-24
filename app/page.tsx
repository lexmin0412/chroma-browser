"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyHeader,
	EmptyTitle,
	EmptyDescription,
	EmptyMedia,
	EmptyContent,
} from "@/components/ui/empty";
import ConnectionList from "@/components/ConnectionList";
import ConnectionFormDrawer from "@/components/ConnectionFormDrawer";
import { IConnectionItem, IConnectionFlatItem } from "@/types";
import { chromaService } from "@/app/utils/chroma-service";
import Image from "next/image";

export default function HomePage() {
	const router = useRouter();
	const [connections, setConnections] = useState<IConnectionItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Drawer states
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingConnection, setEditingConnection] =
		useState<IConnectionItem | null>(null);
	const [editingFormData, setEditingFormData] =
		useState<Partial<IConnectionFlatItem>>();

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
		const flatData: Partial<IConnectionFlatItem> = {
			name: connection.name,
			type: connection.type,
			description: connection.description,
			...(connection.type === "ChromaNormal"
				? {
						host: connection.config.host,
						port: connection.config.port,
				  }
				: {
						apiKey: connection.config.apiKey,
						tenant: connection.config.tenant,
						database: connection.config.database,
				  }),
		};
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

	const handleFormSubmit = async (formData: any) => {
		try {
			const config = {};
			if (formData.type === "ChromaNormal") {
				Object.assign(config, { host: formData.host, port: formData.port });
			} else {
				Object.assign(config, {
					apiKey: formData.apiKey,
					tenant: formData.tenant,
					database: formData.database,
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
			</div>

			{isLoading ? (
				<div className="flex justify-center items-center py-12">
					<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
				</div>
			) : connections.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Database className="w-12 h-12 text-muted-foreground" />
						</EmptyMedia>
						<EmptyTitle>No Connections Found</EmptyTitle>
						<EmptyDescription>
							Configure a connection to your ChromaDB instance to get started.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={handleAddConnection}>
							<Plus className="mr-2 h-4 w-4" />
							Add Connection
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-semibold tracking-tight">
							Your Connections
						</h2>
						<Button onClick={handleAddConnection}>
							<Plus className="mr-2 h-4 w-4" />
							Add Connection
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
