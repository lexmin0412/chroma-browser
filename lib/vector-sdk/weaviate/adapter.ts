
import { WeaviateClient, Collection } from "weaviate-client";
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

export class WeaviateCollectionAdapter implements VectorCollection {
  private collection: Collection;

  constructor(collection: Collection) {
    this.collection = collection;
  }

  get name(): string {
    return this.collection.name;
  }

  get metadata(): Record<string, any> | undefined {
    return {};
  }

  async count(): Promise<number> {
    const response = await this.collection.aggregate.overAll();
    return response.totalCount;
  }

  async add(params: AddParams): Promise<any> {
    const items = [];
    if (params.documents && params.documents.length > 0) {
        for (let i = 0; i < params.documents.length; i++) {
            items.push({
                id: params.ids[i],
                properties: params.metadatas ? params.metadatas[i] : {},
                vectors: params.embeddings ? params.embeddings[i] : undefined,
                document: params.documents[i]
            });
        }
    } else if (params.ids && params.ids.length > 0) {
        for (let i = 0; i < params.ids.length; i++) {
             items.push({
                id: params.ids[i],
                properties: params.metadatas ? params.metadatas[i] : {},
                vectors: params.embeddings ? params.embeddings[i] : undefined,
            });
        }
    }

    if (items.length > 0) {
        const response = await this.collection.data.insertMany(items as any);
        return response;
    }
    return null;
  }

  async query(params: QueryParams): Promise<any> {
    const queryBuilder = this.collection.query;

    if (params.queryEmbeddings && params.queryEmbeddings.length > 0) {
        const response = await queryBuilder.nearVector(params.queryEmbeddings[0], {
            limit: params.nResults,
            returnMetadata: ['distance', 'id'] as any,
            returnProperties: params.include?.includes('metadatas') || params.include?.includes('documents') ? undefined : [],
        });
        return response;
    } else if (params.queryTexts && params.queryTexts.length > 0) {
         const response = await queryBuilder.nearText(params.queryTexts, {
            limit: params.nResults,
        });
        return response;
    } else {
        const response = await queryBuilder.fetchObjects({
            limit: params.nResults,
        });
        return response;
    }
  }

  async delete(params: DeleteParams): Promise<any> {
    if (params.ids && params.ids.length > 0) {
        // @ts-ignore
        const filter = this.collection.filter;
        return await this.collection.data.deleteMany(
            // @ts-ignore
            filter.byIds ? filter.byIds(params.ids) : filter.byId(params.ids)
        );
    }
    return null;
  }

  async get(params: GetParams = {}): Promise<any> {
    if (params.ids && params.ids.length > 0) {
        // @ts-ignore
         const filter = this.collection.filter;
         const response = await this.collection.query.fetchObjects({
            limit: params.limit,
            // @ts-ignore
            filters: filter.byIds ? filter.byIds(params.ids) : filter.byId(params.ids)
        });
        return response;
    }
     const response = await this.collection.query.fetchObjects({
        limit: params.limit,
        offset: params.offset
    });
    return response;
  }

  async update(params: UpdateParams): Promise<any> {
    throw new Error("Batch update not fully implemented for Weaviate adapter yet");
  }

  async upsert(params: AddParams): Promise<any> {
    return this.add(params);
  }

  async modify(params: { name?: string; metadata?: Record<string, any> }): Promise<any> {
     throw new Error("Modify collection not supported for Weaviate adapter yet");
  }
}

export class WeaviateClientAdapter implements VectorClient {
  private client: WeaviateClient;

  constructor(client: WeaviateClient) {
    this.client = client;
  }

  async listCollections(): Promise<CollectionInfo[]> {
    const collections = await this.client.collections.listAll();
    const collectionList: CollectionInfo[] = [];

    // Handle Map or Object
    // const entries = collections instanceof Map ? collections.entries() : Object.entries(collections as any);

    // for (const [name, config] of entries) {
    //     collectionList.push({
    //         name: name,
    //         metadata: config as any
    //     });
    // }
    return collections;
  }

  async createCollection(name: string, metadata?: Record<string, any>): Promise<VectorCollection> {
    const collection = await this.client.collections.create({
        name,
    });
    return new WeaviateCollectionAdapter(collection);
  }

  async getCollection(name: string): Promise<VectorCollection> {
    const collection = this.client.collections.get(name);
    return new WeaviateCollectionAdapter(collection);
  }

  async deleteCollection(name: string): Promise<void> {
    await this.client.collections.delete(name);
  }
}
