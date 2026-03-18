import { z } from "zod";
export const toolDef = {
    name: "get_utm_breakdown",
    description: "Get breakdown by UTM parameters to analyze campaign performance.",
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
    handler: async (client, params) => {
        const { utm_param, date_range, limit, filters } = params;
        const dim = `visit:utm_${utm_param}`;
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
