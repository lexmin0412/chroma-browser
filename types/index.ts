import { Connection } from "@/app/generated/prisma/client";

export interface IChromaNormalConnectionItem extends Connection {
	type: 'ChromaNormal';
	config: {
		host: string;
		port: number;
	}
}

export type IChromaNormalConnectionFlatItem = Omit<IChromaNormalConnectionItem, 'config'> & IChromaNormalConnectionItem['config']

export interface IChromaCloudConnectionItem extends Connection {
	type: 'ChromaCloud';
	config: {
		apiKey: string;
		tenant: string;
		database: string;
	}
}

export type IChromaCloudConnectionFlatItem = Omit<IChromaCloudConnectionItem, 'config'> & IChromaCloudConnectionItem['config']

export type IConnectionItem =
	| IChromaCloudConnectionItem
	| IChromaNormalConnectionItem

export type IConnectionFlatItem =
	| IChromaCloudConnectionFlatItem
	| IChromaNormalConnectionFlatItem
