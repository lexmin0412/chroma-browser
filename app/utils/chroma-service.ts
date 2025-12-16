import type { CollectionMetadata, Metadata, Where, WhereDocument } from 'chromadb';

// 客户端服务用于与服务端 API 通信
class ChromaService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  // 集合相关操作

  // 创建集合
  async createCollection(name: string, metadata?: CollectionMetadata) {
    const response = await fetch(`${this.baseUrl}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, metadata }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.collection;
  }

  // 获取所有集合
  async listCollections() {
    const response = await fetch(`${this.baseUrl}/collections`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.collections;
  }

  // 删除集合
  async deleteCollection(name: string) {
    const response = await fetch(`${this.baseUrl}/collections`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result;
  }

  // 记录相关操作

  // 添加记录
  async addRecords(collectionName: string, params: { ids: string[]; embeddings?: number[][]; metadatas?: Metadata[]; documents?: string[] }) {
    const response = await fetch(`${this.baseUrl}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionName, params }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.result;
  }

  // 获取记录
  async getRecords(collectionName: string, params?: { ids?: string[]; where?: Where; limit?: number; offset?: number; include?: ('distances' | 'documents' | 'embeddings' | 'metadatas' | 'uris')[]; whereDocument?: WhereDocument }) {
		console.log('enter getRecords', collectionName)
    // 构建查询参数
    const queryParams = new URLSearchParams();
    queryParams.append('collection', collectionName);
    queryParams.append('action', 'get');

    if (params) {
      if (params.ids && params.ids.length > 0) {
        queryParams.append('ids', params.ids.join(','));
      }

      if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }

      if (params.where) {
        queryParams.append('where', JSON.stringify(params.where));
      }
    }

    const response = await fetch(`${this.baseUrl}/records?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.result;
  }

  // 查询记录
  async queryRecords(collectionName: string, params: { queryEmbeddings?: number[][]; queryTexts?: string[]; ids?: string[]; nResults: number; where?: Where; include?: ('distances' | 'documents' | 'embeddings' | 'metadatas' | 'uris')[] }) {
    const response = await fetch(`${this.baseUrl}/records`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionName, params }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.result;
  }

  // 删除记录
  async deleteRecords(collectionName: string, params: { ids?: string[]; where?: Where; whereDocument?: WhereDocument }) {
    const response = await fetch(`${this.baseUrl}/records`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionName, params }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.result;
  }

  // 更新记录
  async updateRecords(collectionName: string, params: { ids: string[]; embeddings?: number[][]; metadatas?: Metadata[]; documents?: string[] }) {
    const response = await fetch(`${this.baseUrl}/records`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionName, params }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.result;
  }

  // 插入更新记录
  async upsertRecords(collectionName: string, params: { ids: string[]; embeddings?: number[][]; metadatas?: Metadata[]; documents?: string[] }) {
    // 对于 upsert 操作，我们可以使用相同的更新端点
    // 因为 Chroma 的 upsert 方法会自动处理不存在的记录
    return this.updateRecords(collectionName, params);
  }

  // 获取集合记录数量
  async countRecords(collectionName: string) {
    const response = await fetch(`${this.baseUrl}/records?collection=${encodeURIComponent(collectionName)}&action=count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.count;
  }

  // 服务器状态相关操作

  // 检查服务器状态
  async checkServerStatus() {
    const response = await fetch(`${this.baseUrl}/server`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return {
      heartbeat: result.heartbeat,
      version: result.version
    };
  }

  // 重置数据库
  async resetDatabase() {
    const response = await fetch(`${this.baseUrl}/server`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result;
  }
}

// 导出单例实例
export const chromaService = new ChromaService();
