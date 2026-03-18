import { z } from "zod";
export const toolDef = {
    name: "get_custom_property_breakdown",
    description: "Get breakdown by a custom event property. property_name is the key without the 'event:props:' prefix.",
    schema: {
        property_name: z
            .string()
            .describe("Custom property key (without 'event:props:' prefix), e.g. 'plan', 'category'"),
        date_range: z
            .union([z.string(), z.array(z.string())])
            .describe("Date range"),
        limit: z
            .number()
            .int()
            .positive()
            .default(10)
            .describe("Number of results"),
        filters: z.unknown().optional().describe("Optional filter expression"),
    },
    handler: async (client, params) => {
        const { property_name, date_range, limit, filters } = params;
        const data = await client.query({
            metrics: ["visitors", "events"],
            date_range,
            dimensions: [`event:props:${property_name}`],
            filters,
            pagination: { limit },
        });
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    },
};
