import { ChromaClient, Collection, CollectionMetadata, Metadata, GetResult, QueryResult, Where, WhereDocument } from 'chromadb';

// 创建 ChromaClient 单例实例
class ChromaManager {
  private static instance: ChromaManager;
  private client: ChromaClient;

  private constructor() {
    // 默认连接到本地 Chroma DB 服务器
    this.client = new ChromaClient({
      path: 'http://localhost:3003',
    });
  }

  // 获取单例实例
  public static getInstance(): ChromaManager {
    if (!ChromaManager.instance) {
      ChromaManager.instance = new ChromaManager();
    }
    return ChromaManager.instance;
  }

  // 获取原始 ChromaClient 实例
  public getClient(): ChromaClient {
    return this.client;
  }

  // 集合相关操作

  // 创建集合
  public async createCollection(name: string, metadata?: CollectionMetadata) {
    return await this.client.createCollection({
      name,
      metadata,
    });
  }

  // 获取集合
  public async getCollection(name: string): Promise<Collection> {
    return await this.client.getCollection({
      name,
    });
  }

  // 获取或创建集合
  public async getOrCreateCollection(name: string, metadata?: CollectionMetadata) {
    return await this.client.getOrCreateCollection({
      name,
      metadata,
    });
  }

  // 删除集合
  public async deleteCollection(name: string) {
    return await this.client.deleteCollection({
      name,
    });
  }

  // 列出所有集合
  public async listCollections(): Promise<Collection[]> {
    return await this.client.listCollections();
  }

  // 统计集合数量
  public async countCollections(): Promise<number> {
    return await this.client.countCollections();
  }

  // 记录相关操作

  // 向集合中添加记录
  public async addRecords(
    collectionName: string,
    params: { ids: string[]; embeddings?: number[][]; metadatas?: Metadata[]; documents?: string[] }
  ) {
    const collection = await this.getCollection(collectionName);
    return await collection.add(params);
  }

  // 从集合中获取记录
  public async getRecords(
    collectionName: string,
    params?: { ids?: string[]; where?: Where; limit?: number; offset?: number; include?: ('distances' | 'documents' | 'embeddings' | 'metadatas' | 'uris')[]; whereDocument?: WhereDocument }
  ): Promise<GetResult<Metadata>> {
    const collection = await this.getCollection(collectionName);
    return await collection.get(params);
  }

  // 查询记录
  public async queryRecords(
    collectionName: string,
    params: {
      queryEmbeddings?: number[][];
      queryTexts?: string[];
      ids?: string[];
      nResults: number;
      where?: Where;
      include?: ('distances' | 'documents' | 'embeddings' | 'metadatas' | 'uris')[]
    }
  ): Promise<QueryResult<Metadata>> {
    const collection = await this.getCollection(collectionName);
    return await collection.query(params);
  }

  // 删除记录
  public async deleteRecords(
    collectionName: string,
    params: { ids?: string[]; where?: Where; whereDocument?: WhereDocument }
  ) {
    const collection = await this.getCollection(collectionName);
    return await collection.delete(params);
  }

  // 修改记录
  public async updateRecords(
    collectionName: string,
    params: { ids: string[]; embeddings?: number[][]; metadatas?: Metadata[]; documents?: string[] }
  ) {
    const collection = await this.getCollection(collectionName);
    return await collection.update(params);
  }

  // 插入或更新记录
  public async upsertRecords(
    collectionName: string,
    params: { ids: string[]; embeddings?: number[][]; metadatas?: Metadata[]; documents?: string[] }
  ) {
    const collection = await this.getCollection(collectionName);
    return await collection.upsert(params);
  }

  // 查看集合中的前几条记录
  public async peekCollection(collectionName: string, limit?: number) {
    const collection = await this.getCollection(collectionName);
    return await collection.peek({ limit });
  }

  // 统计集合中的记录数量
  public async countRecords(collectionName: string): Promise<number> {
    const collection = await this.getCollection(collectionName);
    return await collection.count();
  }

  // 修改集合名称或元数据
  public async modifyCollection(collectionName: string, params: { name?: string; metadata?: CollectionMetadata }) {
    const collection = await this.getCollection(collectionName);
    return await collection.modify(params);
  }

  // 心跳检查
  public async heartbeat(): Promise<number> {
    return await this.client.heartbeat();
  }

  // 获取API版本
  public async version(): Promise<string> {
    return await this.client.version();
  }

  // 重置数据库状态
  public async reset(): Promise<void> {
    return await this.client.reset();
  }
}

// 导出单例实例
export const chromaManager = ChromaManager.getInstance();
