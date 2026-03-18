import { z } from "zod";
import type { PlausibleClient } from "../plausible-client.js";
import type { ToolDefinition } from "./types.js";
import type { DateRange } from "../types.js";

export const toolDef: ToolDefinition = {
  name: "get_breakdown_by_device",
  description: "Get visitors broken down by device type (Desktop, Mobile, Tablet).",
  schema: {
    date_range: z
      .union([z.string(), z.array(z.string())])
      .describe("Date range: '7d', '30d', 'month', etc."),
    filters: z.unknown().optional().describe("Optional filter expression"),
  },
  handler: async (client: PlausibleClient, params: Record<string, unknown>) => {
    const { date_range, filters } = params as {
      date_range: DateRange;
      filters?: unknown;
    };

    const data = await client.query({
      metrics: ["visitors", "visits"],
      date_range,
      dimensions: ["visit:device"],
      filters,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
};
