import type { PlausibleQuery, PlausibleResponse } from "./types.js";
export declare class PlausibleClient {
    private apiKey;
    private siteId;
    private baseUrl;
    constructor(apiKey: string, siteId: string, baseUrl?: string);
    query(params: Omit<PlausibleQuery, "site_id">): Promise<PlausibleResponse>;
    getCurrentVisitors(): Promise<number>;
    private handleError;
}
