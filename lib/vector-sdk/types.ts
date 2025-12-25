
export interface CollectionInfo {
  name: string;
  metadata?: Record<string, any>;
}

export interface AddParams {
  ids: string[];
  embeddings?: number[][];
  metadatas?: Record<string, any>[];
  documents?: string[];
  [key: string]: any; // Allow extra params for flexibility
}

export interface QueryParams {
  queryEmbeddings?: number[][];
  queryTexts?: string[];
  nResults?: number;
  where?: any;
  whereDocument?: any;
  include?: string[];
  [key: string]: any;
}

export interface DeleteParams {
  ids?: string[];
  where?: any;
  whereDocument?: any;
  [key: string]: any;
}

export interface GetParams {
  ids?: string[];
  where?: any;
  limit?: number;
  offset?: number;
  include?: string[];
  [key: string]: any;
}

export interface UpdateParams {
  ids: string[];
  embeddings?: number[][];
  metadatas?: Record<string, any>[];
  documents?: string[];
  [key: string]: any;
}

export interface VectorCollection {
  name: string;
  metadata?: Record<string, any>;
  
  count(): Promise<number>;
  add(params: AddParams): Promise<any>;
  query(params: QueryParams): Promise<any>;
  delete(params: DeleteParams): Promise<any>;
  get(params?: GetParams): Promise<any>;
  update(params: UpdateParams): Promise<any>;
  upsert(params: AddParams): Promise<any>;
  modify(params: { name?: string; metadata?: Record<string, any> }): Promise<any>;
}

export interface VectorClient {
  listCollections(): Promise<CollectionInfo[]>;
  createCollection(name: string, metadata?: Record<string, any>): Promise<VectorCollection>;
  getCollection(name: string): Promise<VectorCollection>;
  deleteCollection(name: string): Promise<void>;
  reset?(): Promise<void>;
  heartbeat?(): Promise<number>;
  version?(): Promise<string>;
}
