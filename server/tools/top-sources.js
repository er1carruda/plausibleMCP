import { z } from "zod";
export const toolDef = {
    name: "get_top_sources",
    description: "Get top traffic sources. source_type: 'source' = traffic source (e.g. Google), 'referrer' = full referrer URL, 'channel' = channel grouping (Organic Search, Direct, etc.).",
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
        filters: z.array(z.unknown()).optional().describe('Optional filters, e.g. [["is", "event:page", ["/blog"]]]'),
    },
    handler: async (client, params) => {
        const { date_range, limit, source_type, filters } = params;
        let dim;
        if (source_type === "referrer") {
            dim = "visit:referrer";
        }
        else if (source_type === "channel") {
            dim = "visit:channel";
        }
        else {
            dim = "visit:source";
        }
        const data = await client.query({
            metrics: ["visitors", "visits"],
            date_range,
            dimensions: [dim],
            pagination: { limit },
            filters,
        });
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    },
};
