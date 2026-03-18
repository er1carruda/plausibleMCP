import { z } from "zod";
import type { PlausibleClient } from "../plausible-client.js";
import type { ToolDefinition } from "./types.js";
import type { DateRange } from "../types.js";

export const toolDef: ToolDefinition = {
  name: "get_top_sources",
  description:
    "Get top traffic sources. source_type: 'source' = traffic source (e.g. Google), 'referrer' = full referrer URL, 'channel' = channel grouping (Organic Search, Direct, etc.).",
  schema: {
    date_range: z
      .union([z.string(), z.array(z.string())])
      .describe("Date range: '7d', '30d', 'month', etc."),
    limit: z
      .number()
      .int()
      .positive()
      .default(10)
      .describe("Number of sources to return"),
    source_type: z
      .enum(["source", "referrer", "channel"])
      .default("source")
      .describe("Type of source breakdown"),
    filters: z.unknown().optional().describe("Optional filter expression"),
  },
  handler: async (client: PlausibleClient, params: Record<string, unknown>) => {
    const { date_range, limit, source_type, filters } = params as {
      date_range: DateRange;
      limit: number;
      source_type: "source" | "referrer" | "channel";
      filters?: unknown;
    };

    let dim: string;
    if (source_type === "referrer") {
      dim = "visit:referrer";
    } else if (source_type === "channel") {
      dim = "visit:channel";
    } else {
      dim = "visit:source";
    }

    const data = await client.query({
      metrics: ["visitors", "visits"],
      date_range,
      dimensions: [dim],
      limit,
      filters,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
};
