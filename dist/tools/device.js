import { z } from "zod";
export const toolDef = {
    name: "get_breakdown_by_device",
    description: "Get visitors broken down by device type (Desktop, Mobile, Tablet).",
    schema: {
        date_range: z
            .union([z.string(), z.array(z.string())])
            .describe("Date range: '7d', '30d', 'month', etc."),
        filters: z.unknown().optional().describe("Optional filter expression"),
    },
    handler: async (client, params) => {
        const { date_range, filters } = params;
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
