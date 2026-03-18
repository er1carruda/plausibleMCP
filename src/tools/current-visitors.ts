import { z } from "zod";
import type { PlausibleClient } from "../plausible-client.js";
import type { ToolDefinition } from "./types.js";

export const toolDef: ToolDefinition = {
  name: "get_current_visitors",
  description: "Get the number of people currently on the site (active in the last 5 minutes)",
  schema: {},
  handler: async (client: PlausibleClient, _params: Record<string, unknown>) => {
    const count = await client.getCurrentVisitors();
    return {
      content: [{ type: "text", text: `Current visitors: ${count}` }],
    };
  },
};
