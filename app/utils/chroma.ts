import { ChromaClient } from 'chromadb';

// 创建 ChromaClient 实例
export const getClient = (host: string, port: number) => {
  return new ChromaClient({
    host,
    port,
  });
};

// 获取集合实例
export const getCollection = async (client: ChromaClient, name: string) => {
  return await client.getCollection({ name });
};
