import { z } from "zod";
import type { PlausibleClient } from "../plausible-client.js";
import type { ToolDefinition } from "./aggregate.js";
import type { DateRange } from "../types.js";

export const toolDef: ToolDefinition = {
  name: "get_breakdown_by_location",
  description:
    "Get visitors broken down by geographic location. Use country_filter to drill into regions of a specific country, or region_filter to drill into cities of a specific region.",
  schema: {
    location_type: z
      .enum(["country", "region", "city"])
      .default("country")
      .describe("Geographic granularity"),
    date_range: z
      .union([z.string(), z.array(z.string())])
      .describe("Date range"),
    limit: z
      .number()
      .int()
      .positive()
      .default(10)
      .describe("Number of results to return"),
    country_filter: z
      .string()
      .optional()
      .describe("ISO 2-letter country code to filter regions (e.g. 'US', 'BR')"),
    region_filter: z
      .string()
      .optional()
      .describe("Region code to filter cities"),
    filters: z
      .unknown()
      .optional()
      .describe("Optional additional filter expression"),
  },
  handler: async (client: PlausibleClient, params: Record<string, unknown>) => {
    const { location_type, date_range, limit, country_filter, region_filter, filters } =
      params as {
        location_type: "country" | "region" | "city";
        date_range: DateRange;
        limit: number;
        country_filter?: string;
        region_filter?: string;
        filters?: unknown;
      };

    let dim: string;
    if (location_type === "region") {
      dim = "visit:region_name";
    } else if (location_type === "city") {
      dim = "visit:city_name";
    } else {
      dim = "visit:country_name";
    }

    let combinedFilters: unknown = filters ?? undefined;
    const autoFilters: unknown[] = [];
    if (country_filter) autoFilters.push(["is", "visit:country", [country_filter]]);
    if (region_filter) autoFilters.push(["is", "visit:region", [region_filter]]);
    if (autoFilters.length > 0) {
      const allFilters = filters ? [...autoFilters, filters] : autoFilters;
      combinedFilters = allFilters.length === 1 ? allFilters[0] : ["and", allFilters];
    }

    const data = await client.query({
      metrics: ["visitors", "visits"],
      date_range,
      dimensions: [dim],
      limit,
      filters: combinedFilters,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
};
