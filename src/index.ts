import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PlausibleClient } from "./plausible-client.js";
import { tools } from "./tools/index.js";

const apiKey = process.env.PLAUSIBLE_API_KEY;
const siteId = process.env.PLAUSIBLE_SITE_ID;

if (!apiKey || !siteId) {
  const missing: string[] = [];
  if (!apiKey) missing.push("PLAUSIBLE_API_KEY");
  if (!siteId) missing.push("PLAUSIBLE_SITE_ID");
  process.stderr.write(
    `Error: Missing required environment variables: ${missing.join(", ")}\n`
  );
  process.exit(1);
}

const baseUrl = process.env.PLAUSIBLE_BASE_URL ?? "https://plausible.io";
const client = new PlausibleClient(apiKey, siteId, baseUrl);

const server = new McpServer({
  name: "plausible-analytics",
  version: "0.1.0",
});

// Register all tools
for (const tool of tools) {
  server.tool(tool.name, tool.description, tool.schema, async (params) => {
    return tool.handler(client, params);
  });
}

const transport = new StdioServerTransport();
await server.connect(transport);
