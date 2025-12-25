import { ChromaClient, CloudClient } from "chromadb";
import weaviate, { ApiKey, WeaviateClient } from 'weaviate-client';
import { IConnectionItem } from "@/types";

// 连接类型定义
export type ConnectionType = "ChromaNormal" | "ChromaCloud" | "WeaviateCloud";

// 创建 Client 实例
export const getClient = async (connection: IConnectionItem) => {
	if (!connection.config) {
		throw new Error(`Connection config is required for ${connection.type} connection`);
	}

	switch (connection.type) {
		case "ChromaNormal":
			// Chroma Normal 连接（本地或自托管）
			return new ChromaClient({
				host: connection.config.host as string,
				port: connection.config.port as number,
			});
		case "ChromaCloud":
			// Chroma Cloud 连接
			return new CloudClient({
				apiKey: connection.config.apiKey as string,
				tenant: connection.config.tenant as string,
				database: connection.config.database as string,
			});
		case "WeaviateCloud":
			// Weaviate Cloud 连接
			return await weaviate.connectToWeaviateCloud(
				connection.config.weaviateURL as string,
				{
					authCredentials: new ApiKey(connection.config.weaviateApiKey as string),
				}
			);
		default:
			throw new Error(`Unsupported connection type: ${(connection as Record<string, string>).type}`);
	}
};

// 获取集合实例
export const getCollection = async (type: ConnectionType, client: ChromaClient | CloudClient | WeaviateClient, name: string) => {
	if (type === "WeaviateCloud") {
		return await (client as WeaviateClient).collections.get(name)
	}
	return await (client as ChromaClient | CloudClient).getCollection({ name });
};
