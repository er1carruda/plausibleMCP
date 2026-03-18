import { z } from "zod";
import type { PlausibleClient } from "../plausible-client.js";
export interface ToolDefinition {
    name: string;
    description: string;
    schema: Record<string, z.ZodTypeAny>;
    handler: (client: PlausibleClient, params: Record<string, unknown>) => Promise<{
        content: Array<{
            type: "text";
            text: string;
        }>;
    }>;
}
export declare const toolDef: ToolDefinition;
