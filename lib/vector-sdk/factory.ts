
import { ChromaClient, CloudClient } from "chromadb";
import weaviate, { ApiKey } from 'weaviate-client';
import { VectorClient } from "./types";
import { ChromaClientAdapter } from "./chroma/adapter";
import { WeaviateClientAdapter } from "./weaviate/adapter";
import { IConnectionItem } from "@/types";

export class VectorClientFactory {
  static async getClient(connection: IConnectionItem): Promise<VectorClient> {
    if (!connection.config) {
      throw new Error(`Connection config is required for ${connection.type} connection`);
    }

    switch (connection.type) {
      case "ChromaNormal":
        // Chroma Normal 连接（本地或自托管）
        const chromaClient = new ChromaClient({
          host: connection.config.host as string,
          port: connection.config.port as number,
        });
        return new ChromaClientAdapter(chromaClient);

      case "ChromaCloud":
        // Chroma Cloud 连接
        const cloudClient = new CloudClient({
          apiKey: connection.config.apiKey as string,
          tenant: connection.config.tenant as string,
          database: connection.config.database as string,
        });
        return new ChromaClientAdapter(cloudClient);

      case "WeaviateCloud":
        // Weaviate Cloud 连接
        const weaviateClient = await weaviate.connectToWeaviateCloud(
          connection.config.weaviateURL as string,
          {
            authCredentials: new ApiKey(connection.config.weaviateApiKey as string),
          }
        );
        return new WeaviateClientAdapter(weaviateClient);

      default:
        throw new Error(`Unsupported connection type: ${(connection as any).type}`);
    }
  }
}
