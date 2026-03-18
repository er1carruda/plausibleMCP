import { z } from "zod";
import type { PlausibleClient } from "../plausible-client.js";
import type { ToolDefinition } from "./types.js";
import type { DateRange } from "../types.js";

export const toolDef: ToolDefinition = {
  name: "get_utm_breakdown",
  description:
    "Get breakdown by UTM parameters to analyze campaign performance.",
  schema: {
    utm_param: z
      .enum(["source", "medium", "campaign", "content", "term"])
      .describe("UTM parameter to analyze"),
    date_range: z
      .union([z.string(), z.array(z.string())])
      .describe("Date range"),
    limit: z
      .number()
      .int()
      .positive()
      .default(10)
      .describe("Number of results to return"),
    filters: z.unknown().optional().describe("Optional filter expression"),
  },
  handler: async (client: PlausibleClient, params: Record<string, unknown>) => {
    const { utm_param, date_range, limit, filters } = params as {
      utm_param: "source" | "medium" | "campaign" | "content" | "term";
      date_range: DateRange;
      limit: number;
      filters?: unknown;
    };

    const dim = `visit:utm_${utm_param}`;

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
