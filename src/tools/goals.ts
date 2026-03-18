import { z } from "zod";
import type { PlausibleClient } from "../plausible-client.js";
import type { ToolDefinition } from "./aggregate.js";

export const toolDef: ToolDefinition = {
  name: "get_goal_conversions",
  description:
    "Get conversion data for goals/events tracked in Plausible. Optionally filter to a specific goal by name.",
  schema: {
    date_range: z
      .union([z.string(), z.array(z.string())])
      .describe("Date range"),
    goal_filter: z
      .string()
      .optional()
      .describe("Filter to a specific goal name"),
    filters: z
      .unknown()
      .optional()
      .describe("Optional additional filter expression"),
  },
  handler: async (client: PlausibleClient, params: Record<string, unknown>) => {
    const { date_range, goal_filter, filters } = params as {
      date_range: string | string[];
      goal_filter?: string;
      filters?: unknown;
    };

    let combinedFilters: unknown;

    if (goal_filter && filters) {
      combinedFilters = ["and", [["is", "event:goal", [goal_filter]], filters]];
    } else if (goal_filter) {
      combinedFilters = ["is", "event:goal", [goal_filter]];
    } else {
      combinedFilters = filters;
    }

    const data = await client.query({
      metrics: ["visitors", "events", "conversion_rate"],
      date_range,
      dimensions: ["event:goal"],
      filters: combinedFilters,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
};
