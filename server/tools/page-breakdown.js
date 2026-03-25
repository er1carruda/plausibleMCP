import { z } from "zod";
function formatResults(data, dimensions, metrics) {
    if (data.results.length === 0)
        return "No data found for this query.";
    const lines = data.results.map((row, i) => {
        const dimStr = row.dimensions?.join(" | ") ?? "";
        const metricStr = metrics.map((m, j) => `${m}: ${row.metrics[j]}`).join(", ");
        return `${i + 1}. ${dimStr} — ${metricStr}`;
    });
    return lines.join("\n");
}
export const toolDef = {
    name: "get_page_breakdown",
    description: "Get detailed metrics for a specific page or page pattern (supports wildcards like '/blog/**').",
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
        filters: z
            .array(z.unknown())
            .optional()
            .describe('Optional additional filters, e.g. [["is", "visit:source", ["Google"]]]'),
    },
    handler: async (client, params) => {
        const { page_path, date_range, metrics, filters: userFilters } = params;
        const filterOp = page_path.includes("*") ? "matches" : "is";
        const pageFilterExpr = [filterOp, "event:page", [page_path]];
        const combinedFilters = userFilters ? [pageFilterExpr, userFilters] : [pageFilterExpr];
        const data = await client.query({
            metrics,
            date_range,
            filters: combinedFilters,
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
