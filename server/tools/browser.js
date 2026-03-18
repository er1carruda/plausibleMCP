import { z } from "zod";
export const toolDef = {
    name: "get_breakdown_by_browser",
    description: "Get visitors broken down by browser. Set include_version to true to also see browser versions.",
    schema: {
        date_range: z
            .union([z.string(), z.array(z.string())])
            .describe("Date range"),
        limit: z
            .number()
            .int()
            .positive()
            .default(10)
            .describe("Number of results"),
        include_version: z
            .boolean()
            .default(false)
            .describe("Include browser version breakdown"),
        filters: z.unknown().optional().describe("Optional filter expression"),
    },
    handler: async (client, params) => {
        const { date_range, limit, include_version, filters } = params;
        const dimensions = include_version
            ? ["visit:browser", "visit:browser_version"]
            : ["visit:browser"];
        const data = await client.query({
            metrics: ["visitors", "visits"],
            date_range,
            dimensions,
            filters,
            pagination: { limit },
        });
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    },
};
