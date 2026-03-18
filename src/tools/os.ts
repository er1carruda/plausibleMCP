import { z } from "zod";
import type { PlausibleClient } from "../plausible-client.js";
import type { ToolDefinition } from "./aggregate.js";

export const toolDef: ToolDefinition = {
  name: "get_breakdown_by_os",
  description:
    "Get visitors broken down by operating system. Set include_version to true to see OS versions.",
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
      .describe("Include OS version breakdown"),
    filters: z.unknown().optional().describe("Optional filter expression"),
  },
  handler: async (client: PlausibleClient, params: Record<string, unknown>) => {
    const { date_range, limit, include_version, filters } = params as {
      date_range: string | string[];
      limit: number;
      include_version: boolean;
      filters?: unknown;
    };

    const dimensions = include_version
      ? ["visit:os", "visit:os_version"]
      : ["visit:os"];

    const data = await client.query({
      metrics: ["visitors", "visits"],
      date_range,
      dimensions,
      filters,
      limit,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
};
