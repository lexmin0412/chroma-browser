import { ChromaClient, CloudClient } from "chromadb";
import { Connection } from "@/app/generated/prisma/client";

// 连接类型定义
export type ConnectionType = "ChromaNormal" | "ChromaCloud";

// 创建 ChromaClient 实例
export const getClient = (connection: Connection) => {
	if (connection.type === "ChromaNormal") {
		// Chroma Normal 连接（本地或自托管）
		return new ChromaClient({
			host: connection.host as string,
			port: connection.port as number,
		});
	} else if (connection.type === "ChromaCloud") {
		// Chroma Cloud 连接
		return new CloudClient({
			apiKey: connection.apiKey as string,
			tenant: connection.tenant as string,
			database: connection.database as string,
		});
	} else {
		throw new Error(`Unsupported connection type: ${connection.type}`);
	}
};

// 获取集合实例
export const getCollection = async (client: ChromaClient | CloudClient, name: string) => {
	return await client.getCollection({ name });
};
