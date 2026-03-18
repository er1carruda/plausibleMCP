import { z } from "zod";
import type { PlausibleClient } from "../plausible-client.js";

export interface ToolDefinition {
  name: string;
  description: string;
  schema: Record<string, z.ZodTypeAny>;
  handler: (client: PlausibleClient, params: Record<string, unknown>) => Promise<{
    content: Array<{ type: "text"; text: string }>;
  }>;
}

export const toolDef: ToolDefinition = {
  name: "get_aggregate",
  description:
    "Get aggregate analytics metrics for a time period. Metrics can include: visitors, visits, pageviews, views_per_visit, bounce_rate, visit_duration, events. Date range examples: '7d', '30d', 'month', 'year', 'all', or ['2024-01-01', '2024-03-01'].",
  schema: {
    metrics: z
      .array(z.string())
      .describe("Metrics to retrieve, e.g. ['visitors', 'pageviews', 'bounce_rate']"),
    date_range: z
      .union([z.string(), z.array(z.string())])
      .describe(
        "Date range: '7d', '30d', 'month', 'year', 'all', or ['YYYY-MM-DD', 'YYYY-MM-DD']"
      ),
    filters: z
      .unknown()
      .optional()
      .describe("Optional filter expression, e.g. [\"is\", \"visit:source\", [\"Google\"]]"),
  },
  handler: async (client: PlausibleClient, params: Record<string, unknown>) => {
    const { metrics, date_range, filters } = params as {
      metrics: string[];
      date_range: string | string[];
      filters?: unknown;
    };

    const data = await client.query({ metrics, date_range, filters });

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
};
