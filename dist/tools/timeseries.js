import { z } from "zod";
function formatTimeSeries(data, metrics) {
    if (data.results.length === 0)
        return "No data found for this query.";
    const lines = data.results.map((row, i) => {
        const dimStr = row.dimensions?.join(" | ") ?? String(i + 1);
        const metricStr = metrics.map((m, j) => `${m}: ${row.metrics[j]}`).join(", ");
        return `${dimStr} — ${metricStr}`;
    });
    return lines.join("\n");
}
export const toolDef = {
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
            .unknown()
            .optional()
            .describe("Optional filter expression"),
    },
    handler: async (client, params) => {
        const { metrics, date_range, interval, filters } = params;
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
