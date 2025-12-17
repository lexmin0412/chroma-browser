export interface IChromaNormalConnectionItem {
	host: string;
	port: number;
}

export interface IChromaCloudConnectionItem {
	apiKey: string;
	tenant: string;
	database: string;
}

export interface IWeavitateConnectionItem {
	url: string;
	apiKey: string;
}

export type IConnectionItem =
	| IChromaCloudConnectionItem
	| IChromaNormalConnectionItem
	| IWeavitateConnectionItem;
