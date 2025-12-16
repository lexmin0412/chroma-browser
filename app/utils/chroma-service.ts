import type { CollectionMetadata, Metadata, Where, WhereDocument } from 'chromadb';
import ConfigManager from './config-manager';

// 客户端服务用于与服务端 API 通信
class ChromaService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  // 获取配置的主机和端口
  private getHostAndPort() {
    const config = ConfigManager.getInstance().getConfig();
    if (!ConfigManager.getInstance().isConfigured()) {
      throw new Error('Chroma DB host and port must be configured. Please set them in the settings.');
    }
    return {
      host: config.host,
      port: config.port
    };
  }

  // 构建带参数的 URL
  private buildUrlWithParams(url: string, params: Record<string, string | number>): string {
    const { host, port } = this.getHostAndPort();
    const urlObj = new URL(url, window.location.origin);

    // 添加主机和端口参数
    urlObj.searchParams.append('host', host!);
    urlObj.searchParams.append('port', port!.toString());

    // 添加其他参数
    Object.keys(params).forEach(key => {
      urlObj.searchParams.append(key, params[key].toString());
    });

    return urlObj.toString();
  }

  // 集合相关操作

  // 创建集合
  async createCollection(name: string, metadata?: CollectionMetadata) {
    const { host, port } = this.getHostAndPort();
    const response = await fetch(`${this.baseUrl}/collections?host=${encodeURIComponent(host!)}&port=${port}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, metadata, host, port }),
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
    const { host, port } = this.getHostAndPort();
    const response = await fetch(`${this.baseUrl}/collections?host=${encodeURIComponent(host!)}&port=${port}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, host, port }),
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
    const { host, port } = this.getHostAndPort();
    const response = await fetch(`${this.baseUrl}/records?host=${encodeURIComponent(host!)}&port=${port}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionName, params, host, port }),
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
    const { host, port } = this.getHostAndPort();
    const response = await fetch(`${this.baseUrl}/records?host=${encodeURIComponent(host!)}&port=${port}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionName, params, host, port }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.result;
  }

  // 删除记录
  async deleteRecords(collectionName: string, params: { ids?: string[]; where?: Where; whereDocument?: WhereDocument }) {
    const { host, port } = this.getHostAndPort();
    const response = await fetch(`${this.baseUrl}/records?host=${encodeURIComponent(host!)}&port=${port}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionName, params, host, port }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.result;
  }

  // 更新记录
  async updateRecords(collectionName: string, params: { ids: string[]; embeddings?: number[][]; metadatas?: Metadata[]; documents?: string[] }) {
    const { host, port } = this.getHostAndPort();
    const response = await fetch(`${this.baseUrl}/records?host=${encodeURIComponent(host!)}&port=${port}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionName, params, host, port }),
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
    const { host, port } = this.getHostAndPort();
    const response = await fetch(`${this.baseUrl}/server?host=${encodeURIComponent(host!)}&port=${port}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ host, port }),
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
