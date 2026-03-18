import { z } from "zod";
import type { PlausibleClient } from "../plausible-client.js";
import type { DateRange, PlausibleResponse } from "../types.js";
import type { ToolDefinition } from "./types.js";

function formatResults(
  data: PlausibleResponse,
  dimensions: string[],
  metrics: string[]
): string {
  if (data.results.length === 0) return "No data found for this query.";
  const lines = data.results.map((row, i) => {
    const dimStr = row.dimensions?.join(" | ") ?? "";
    const metricStr = metrics.map((m, j) => `${m}: ${row.metrics[j]}`).join(", ");
    return `${i + 1}. ${dimStr} — ${metricStr}`;
  });
  return lines.join("\n");
}

export const toolDef: ToolDefinition = {
  name: "get_top_pages",
  description:
    "Get top pages ranked by visitors. page_type: 'all' = any page view, 'entry' = landing pages, 'exit' = exit pages.",
  schema: {
    date_range: z
      .union([z.string(), z.array(z.string())])
      .describe("Date range"),
    limit: z
      .number()
      .int()
      .positive()
      .default(10)
      .describe("Number of pages to return"),
    page_type: z
      .enum(["all", "entry", "exit"])
      .default("all")
      .describe("Type of page: all, entry (landing), or exit"),
    filters: z
      .unknown()
      .optional()
      .describe("Optional filter expression"),
  },
  handler: async (client: PlausibleClient, params: Record<string, unknown>) => {
    const { date_range, limit, page_type, filters } = params as {
      date_range: DateRange;
      limit: number;
      page_type: "all" | "entry" | "exit";
      filters?: unknown;
    };

    let dim: string;
    if (page_type === "entry") {
      dim = "visit:entry_page";
    } else if (page_type === "exit") {
      dim = "visit:exit_page";
    } else {
      dim = "event:page";
    }

    const metrics = ["visitors", "pageviews"];
    const data = await client.query({
      metrics,
      date_range,
      dimensions: [dim],
      pagination: { limit },
      filters,
    });

    return {
      content: [{ type: "text", text: formatResults(data, [dim], metrics) }],
    };
  },
};
