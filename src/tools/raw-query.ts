import { z } from "zod";
import type { PlausibleClient } from "../plausible-client.js";
import type { ToolDefinition } from "./aggregate.js";
import type { DateRange } from "../types.js";

export const toolDef: ToolDefinition = {
  name: "plausible_query",
  description:
    "Execute an arbitrary Plausible Stats API v2 query. Use this for advanced analysis not covered by the other tools. See Plausible API v2 docs for full query syntax.",
  schema: {
    metrics: z
      .array(z.string())
      .describe("Metrics to retrieve, e.g. ['visitors', 'pageviews', 'events']"),
    date_range: z
      .union([z.string(), z.array(z.string())])
      .describe(
        "Date range: '7d', '30d', 'month', 'year', 'all', or ['YYYY-MM-DD', 'YYYY-MM-DD']"
      ),
    dimensions: z
      .array(z.string())
      .optional()
      .describe("Dimensions to group by, e.g. ['event:page', 'visit:source']"),
    filters: z
      .unknown()
      .optional()
      .describe("Filter expression, e.g. ['is', 'visit:source', ['Google']]"),
    order_by: z
      .array(z.tuple([z.string(), z.enum(["asc", "desc"])]))
      .optional()
      .describe("Sort order, e.g. [['visitors', 'desc']]"),
    limit: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Max results to return"),
    offset: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe("Pagination offset"),
    include: z
      .record(z.unknown())
      .optional()
      .describe("Extra includes, e.g. {time_labels: true}"),
  },
  handler: async (client: PlausibleClient, params: Record<string, unknown>) => {
    const { metrics, date_range, dimensions, filters, order_by, limit, offset, include } =
      params as {
        metrics: string[];
        date_range: DateRange;
        dimensions?: string[];
        filters?: unknown;
        order_by?: [string, "asc" | "desc"][];
        limit?: number;
        offset?: number;
        include?: Record<string, unknown>;
      };

    const data = await client.query({
      metrics,
      date_range,
      dimensions,
      filters,
      order_by,
      limit,
      offset,
      include,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
    };
  },
};
