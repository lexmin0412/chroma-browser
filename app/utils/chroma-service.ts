import type { Metadata, Where, WhereDocument } from 'chromadb';

// 客户端服务用于与服务端 API 通信
class ChromaService {
  private baseUrl: string;
  private currentConnectionId: number | null;

  constructor() {
    this.baseUrl = '/api';
    this.currentConnectionId = null;
  }

  // 设置当前使用的连接 ID
  setCurrentConnection(id: number) {
    this.currentConnectionId = id;
    localStorage.setItem('currentChromaConnection', id.toString());
  }

  // 获取当前使用的连接 ID
  getCurrentConnection(): number {
    if (!this.currentConnectionId) {
      const savedId = localStorage.getItem('currentChromaConnection');
      if (savedId) {
        this.currentConnectionId = parseInt(savedId);
      } else {
        throw new Error('No Chroma DB connection selected. Please select a connection in the Connections page.');
      }
    }
    return this.currentConnectionId;
  }

  // 构建带参数的 URL
  private buildUrlWithParams(url: string, params: Record<string, string | number>): string {
    const connectionId = this.getCurrentConnection();
    const urlObj = new URL(url, window.location.origin);

    // 添加连接 ID 参数
    urlObj.searchParams.append('connectionId', connectionId.toString());

    // 添加其他参数
    Object.keys(params).forEach(key => {
      urlObj.searchParams.append(key, params[key].toString());
    });

    return urlObj.toString();
  }

  // 集合相关操作

  // 创建集合
  async createCollection(name: string, metadata?: Record<string, unknown>) {
    const connectionId = this.getCurrentConnection();
    const response = await fetch(`${this.baseUrl}/collections?connectionId=${connectionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, metadata, connectionId }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.collection;
  }

  // 获取所有集合
  async listCollections() {
    const url = this.buildUrlWithParams(`${this.baseUrl}/collections`, {});
    const response = await fetch(url, {
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
    const connectionId = this.getCurrentConnection();
    const response = await fetch(`${this.baseUrl}/collections?connectionId=${connectionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, connectionId }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result;
  }

  // 修改集合（名称或元数据）
  async updateCollection(name: string, payload: { newName?: string; metadata?: Record<string, unknown> }) {
    const connectionId = this.getCurrentConnection();
    const response = await fetch(`${this.baseUrl}/collections?connectionId=${connectionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldName: name, ...payload, connectionId }),
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.collection;
  }

  // 记录相关操作

  // 添加记录
  async addRecords(collectionName: string, params: { ids: string[]; embeddings?: number[][]; metadatas?: Metadata[]; documents?: string[] }) {
    const connectionId = this.getCurrentConnection();
    const response = await fetch(`${this.baseUrl}/records?connectionId=${connectionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionName, params, connectionId }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.result;
  }

  // 获取记录
  async getRecords(collectionName: string, params?: { ids?: string[]; where?: Where; limit?: number; offset?: number; include?: ('distances' | 'documents' | 'embeddings' | 'metadatas' | 'uris')[]; whereDocument?: WhereDocument }) {
    console.log('enter getRecords', collectionName);
    // 构建查询参数
    const queryParams: Record<string, string | number> = {
      collection: collectionName,
      action: 'get'
    };

    if (params) {
      if (params.ids && params.ids.length > 0) {
        queryParams['ids'] = params.ids.join(',');
      }

      if (params.limit !== undefined) {
        queryParams['limit'] = params.limit;
      }

      if (params.offset !== undefined) {
        queryParams['offset'] = params.offset;
      }

      if (params.where) {
        queryParams['where'] = JSON.stringify(params.where);
      }

      if (params.whereDocument) {
        queryParams['whereDocument'] = JSON.stringify(params.whereDocument);
      }

      if (params.include) {
        queryParams['include'] = params.include.join(',');
      }
    }

    const url = this.buildUrlWithParams(`${this.baseUrl}/records`, queryParams);
    const response = await fetch(url, {
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
    const connectionId = this.getCurrentConnection();
    const response = await fetch(`${this.baseUrl}/records?connectionId=${connectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionName, params, connectionId }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.result;
  }

  // 删除记录
  async deleteRecords(collectionName: string, params: { ids?: string[]; where?: Where; whereDocument?: WhereDocument }) {
    const connectionId = this.getCurrentConnection();
    const response = await fetch(`${this.baseUrl}/records?connectionId=${connectionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionName, params, connectionId }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.result;
  }

  // 更新记录
  async updateRecords(collectionName: string, params: { ids: string[]; embeddings?: number[][]; metadatas?: Metadata[]; documents?: string[] }) {
    const connectionId = this.getCurrentConnection();
    const response = await fetch(`${this.baseUrl}/records?connectionId=${connectionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionName, params, connectionId }),
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
    const url = this.buildUrlWithParams(`${this.baseUrl}/records`, {
      collection: collectionName,
      action: 'count'
    });
    const response = await fetch(url, {
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
    const url = this.buildUrlWithParams(`${this.baseUrl}/server`, {});
    const response = await fetch(url, {
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
    const connectionId = this.getCurrentConnection();
    const response = await fetch(`${this.baseUrl}/server?connectionId=${connectionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ connectionId }),
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
