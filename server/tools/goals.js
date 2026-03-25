import { z } from "zod";
export const toolDef = {
    name: "get_goal_conversions",
    description: "Get conversion data for goals/events tracked in Plausible. Optionally filter to a specific goal by name.",
    schema: {
        date_range: z
            .union([z.string(), z.array(z.string())])
            .describe("Date range"),
        goal_filter: z
            .string()
            .optional()
            .describe("Filter to a specific goal name"),
        filters: z
            .array(z.unknown())
            .optional()
            .describe('Optional additional filters, e.g. [["is", "visit:source", ["Google"]]]'),
    },
    handler: async (client, params) => {
        const { date_range, goal_filter, filters } = params;
        let combinedFilters;
        if (goal_filter && filters) {
            combinedFilters = ["and", [["is", "event:goal", [goal_filter]], filters]];
        }
        else if (goal_filter) {
            combinedFilters = ["is", "event:goal", [goal_filter]];
        }
        else {
            combinedFilters = filters;
        }
        const data = await client.query({
            metrics: ["visitors", "events", "conversion_rate"],
            date_range,
            dimensions: ["event:goal"],
            filters: combinedFilters,
        });
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    },
};
