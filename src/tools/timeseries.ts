import { z } from "zod";
import type { PlausibleClient } from "../plausible-client.js";
import type { DateRange, PlausibleResponse } from "../types.js";
import type { ToolDefinition } from "./types.js";

function formatTimeSeries(data: PlausibleResponse, metrics: string[]): string {
  if (data.results.length === 0) return "No data found for this query.";
  const lines = data.results.map((row, i) => {
    const dimStr = row.dimensions?.join(" | ") ?? String(i + 1);
    const metricStr = metrics.map((m, j) => `${m}: ${row.metrics[j]}`).join(", ");
    return `${dimStr} — ${metricStr}`;
  });
  return lines.join("\n");
}

export const toolDef: ToolDefinition = {
  name: "get_timeseries",
  description: "Get metrics broken down over time. Useful for trend analysis.",
  schema: {
    metrics: z
      .array(z.string())
      .default(["visitors"])
      .describe("Metrics to retrieve"),
    date_range: z
      .union([z.string(), z.array(z.string())])
      .describe("Date range: '7d', '30d', 'month', etc."),
    interval: z
      .enum(["hour", "day", "week", "month"])
      .default("day")
      .describe("Time granularity"),
    filters: z
      .array(z.unknown())
      .optional()
      .describe('Optional filters, e.g. [["is", "visit:source", ["Google"]]]'),
  },
  handler: async (client: PlausibleClient, params: Record<string, unknown>) => {
    const { metrics, date_range, interval, filters } = params as {
      metrics: string[];
      date_range: DateRange;
      interval: "hour" | "day" | "week" | "month";
      filters?: unknown;
    };

    const data = await client.query({
      metrics,
      date_range,
      dimensions: [`time:${interval}`],
      filters,
    });

    return {
      content: [{ type: "text", text: formatTimeSeries(data, metrics) }],
    };
  },
};
