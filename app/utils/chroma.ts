import { ChromaClient, CloudClient } from "chromadb";
import { IConnectionItem } from "@/types";

// 连接类型定义
export type ConnectionType = "ChromaNormal" | "ChromaCloud";

// 创建 ChromaClient 实例
export const getClient = (connection: IConnectionItem) => {
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
		default:
			throw new Error(`Unsupported connection type: ${(connection as Record<string, string>).type}`);
	}
};

// 获取集合实例
export const getCollection = async (client: ChromaClient | CloudClient, name: string) => {
	return await client.getCollection({ name });
};
