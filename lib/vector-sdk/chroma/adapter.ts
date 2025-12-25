
import { ChromaClient, CloudClient, Collection } from "chromadb";
import { 
  VectorClient, 
  VectorCollection, 
  CollectionInfo,
  AddParams,
  QueryParams,
  DeleteParams,
  GetParams,
  UpdateParams
} from "../types";

export class ChromaCollectionAdapter implements VectorCollection {
  private collection: Collection;

  constructor(collection: Collection) {
    this.collection = collection;
  }

  get name(): string {
    return this.collection.name;
  }

  get metadata(): Record<string, any> | undefined {
    return this.collection.metadata as Record<string, any> | undefined;
  }

  async count(): Promise<number> {
    return await this.collection.count();
  }

  async add(params: AddParams): Promise<any> {
    return await this.collection.add({
      ids: params.ids,
      embeddings: params.embeddings,
      metadatas: params.metadatas,
      documents: params.documents,
    });
  }

  async query(params: QueryParams): Promise<any> {
    return await this.collection.query({
      queryEmbeddings: params.queryEmbeddings,
      queryTexts: params.queryTexts,
      nResults: params.nResults || 10,
      where: params.where,
      whereDocument: params.whereDocument,
      include: params.include as any,
    });
  }

  async delete(params: DeleteParams): Promise<any> {
    return await this.collection.delete({
      ids: params.ids,
      where: params.where,
      whereDocument: params.whereDocument,
    });
  }

  async get(params: GetParams = {}): Promise<any> {
    return await this.collection.get({
      ids: params.ids,
      where: params.where,
      limit: params.limit,
      offset: params.offset,
      include: params.include as any,
    });
  }

  async update(params: UpdateParams): Promise<any> {
    return await this.collection.update({
      ids: params.ids,
      embeddings: params.embeddings,
      metadatas: params.metadatas,
      documents: params.documents,
    });
  }

  async upsert(params: AddParams): Promise<any> {
    return await this.collection.upsert({
      ids: params.ids,
      embeddings: params.embeddings,
      metadatas: params.metadatas,
      documents: params.documents,
    });
  }

  async modify(params: { name?: string; metadata?: Record<string, any> }): Promise<any> {
    return await this.collection.modify({
      name: params.name,
      metadata: params.metadata,
    });
  }
}

export class ChromaClientAdapter implements VectorClient {
  private client: ChromaClient | CloudClient;

  constructor(client: ChromaClient | CloudClient) {
    this.client = client;
  }

  async listCollections(): Promise<CollectionInfo[]> {
    const collections = await this.client.listCollections();
    return collections.map(c => ({
      name: c.name,
      metadata: c.metadata as Record<string, any>
    }));
  }

  async createCollection(name: string, metadata?: Record<string, any>): Promise<VectorCollection> {
    const collection = await this.client.createCollection({
      name,
      metadata,
    });
    return new ChromaCollectionAdapter(collection);
  }

  async getCollection(name: string): Promise<VectorCollection> {
    const collection = await this.client.getCollection({ name });
    return new ChromaCollectionAdapter(collection);
  }

  async deleteCollection(name: string): Promise<void> {
    await this.client.deleteCollection({ name });
  }

  async reset(): Promise<void> {
    if ('reset' in this.client) {
      await (this.client as ChromaClient).reset();
    }
  }

  async heartbeat(): Promise<number> {
    if ('heartbeat' in this.client) {
        return await (this.client as ChromaClient).heartbeat();
    }
    return 0;
  }

  async version(): Promise<string> {
    if ('version' in this.client) {
        return await (this.client as ChromaClient).version();
    }
    return '';
  }
}
