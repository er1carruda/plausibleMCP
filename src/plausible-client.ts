import type { PlausibleQuery, PlausibleResponse } from "./types.js";

export class PlausibleClient {
  private apiKey: string;
  private siteId: string;
  private baseUrl: string;

  constructor(apiKey: string, siteId: string, baseUrl = "https://plausible.io") {
    this.apiKey = apiKey;
    this.siteId = siteId;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async query(params: Omit<PlausibleQuery, "site_id">): Promise<PlausibleResponse> {
    // Defensive: MCP clients may serialize array params as JSON strings
    if (typeof params.filters === "string") {
      try {
        params = { ...params, filters: JSON.parse(params.filters) };
      } catch {
        // leave as-is and let the API return a meaningful error
      }
    }

    const body: PlausibleQuery = {
      site_id: this.siteId,
      ...params,
    };

    const response = await fetch(`${this.baseUrl}/api/v2/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json() as Promise<PlausibleResponse>;
  }

  async getCurrentVisitors(): Promise<number> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/stats/realtime/visitors?site_id=${encodeURIComponent(this.siteId)}`,
      {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json() as Promise<number>;
  }

  private async handleError(response: Response): Promise<never> {
    let message: string;

    try {
      const body = await response.json() as { error?: string };
      message = body.error ?? response.statusText;
    } catch {
      message = response.statusText;
    }

    switch (response.status) {
      case 401:
        throw new Error(`Invalid API key. Please check your PLAUSIBLE_API_KEY. Details: ${message}`);
      case 429: {
        const retryAfter = response.headers.get("retry-after");
        throw new Error(`Rate limited by Plausible API. Try again later.${retryAfter ? ` Retry after ${retryAfter} seconds.` : ""}`);
      }
      case 400:
        throw new Error(`Invalid query: ${message}`);
      default:
        throw new Error(`Plausible API error ${response.status}: ${message}`);
    }
  }
}
