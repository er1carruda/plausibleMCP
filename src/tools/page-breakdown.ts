import { z } from "zod";
import type { PlausibleClient } from "../plausible-client.js";
import type { DateRange, PlausibleResponse } from "../types.js";

export interface ToolDefinition {
  name: string;
  description: string;
  schema: Record<string, z.ZodTypeAny>;
  handler: (client: PlausibleClient, params: Record<string, unknown>) => Promise<{
    content: Array<{ type: "text"; text: string }>;
  }>;
}

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
  name: "get_page_breakdown",
  description:
    "Get detailed metrics for a specific page or page pattern (supports wildcards like '/blog/**').",
  schema: {
    page_path: z
      .string()
      .describe("Page path or pattern, e.g. '/blog' or '/blog/**'"),
    date_range: z
      .union([z.string(), z.array(z.string())])
      .describe("Date range"),
    metrics: z
      .array(z.string())
      .default(["visitors", "pageviews", "bounce_rate", "time_on_page"])
      .describe("Metrics to retrieve"),
  },
  handler: async (client: PlausibleClient, params: Record<string, unknown>) => {
    const { page_path, date_range, metrics } = params as {
      page_path: string;
      date_range: DateRange;
      metrics: string[];
    };

    const filterOp = page_path.includes("*") ? "matches" : "is";
    const filters = [filterOp, "event:page", [page_path]];

    const data = await client.query({
      metrics,
      date_range,
      filters,
    });

    if (data.results.length === 0) {
      return {
        content: [{ type: "text", text: "No data found for this query." }],
      };
    }

    // Aggregate result (no dimensions), display as key-value pairs
    const row = data.results[0];
    const metricStr = metrics.map((m, j) => `${m}: ${row.metrics[j]}`).join("\n");
    const text = `Page: ${page_path}\n${metricStr}`;

    return {
      content: [{ type: "text", text }],
    };
  },
};
