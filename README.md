# Plausible Analytics MCP Server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that connects AI assistants like Claude to your [Plausible Analytics](https://plausible.io) data. Ask questions about your website traffic in plain language.

## Installation

### Claude Desktop — .dxt extension (easiest)

Download `plausible-analytics.dxt` from the [latest release](https://github.com/er1carruda/plausibleMCP/releases) and double-click to install. Claude Desktop will prompt you for your API key and site domain — no manual config needed.

### Claude Code

```bash
claude mcp add plausible node /absolute/path/to/plausibleMCP/dist/index.js \
  -e PLAUSIBLE_API_KEY=your-api-key-here \
  -e PLAUSIBLE_SITE_ID=your-site.com
```

### Manual (Claude Desktop config)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "plausible": {
      "command": "node",
      "args": ["/absolute/path/to/plausibleMCP/dist/index.js"],
      "env": {
        "PLAUSIBLE_API_KEY": "your-api-key-here",
        "PLAUSIBLE_SITE_ID": "your-site.com"
      }
    }
  }
}
```

### Self-hosted Plausible

Add `PLAUSIBLE_BASE_URL` to point to your instance:

```json
"env": {
  "PLAUSIBLE_API_KEY": "your-api-key-here",
  "PLAUSIBLE_SITE_ID": "your-site.com",
  "PLAUSIBLE_BASE_URL": "https://your-plausible-instance.com"
}
```

## Requirements

- Node.js 18+
- A [Plausible Analytics](https://plausible.io) account (Cloud or self-hosted)
- A Plausible Stats API key — get it at plausible.io → Settings → API Keys

## Tools

14 tools covering the full Plausible Stats API v2:

| Tool | Description |
|------|-------------|
| `get_current_visitors` | Real-time visitor count (last 5 min) |
| `get_aggregate` | Aggregate metrics for any time period |
| `get_timeseries` | Metrics over time (hourly, daily, weekly, monthly) |
| `get_top_pages` | Top pages, landing pages, or exit pages |
| `get_page_breakdown` | Detailed metrics for a specific page or pattern |
| `get_top_sources` | Top traffic sources, referrers, or channels |
| `get_utm_breakdown` | UTM campaign/medium/source/content/term breakdown |
| `get_breakdown_by_location` | Visitors by country, region, or city |
| `get_breakdown_by_device` | Visitors by device type |
| `get_breakdown_by_browser` | Visitors by browser (with optional version) |
| `get_breakdown_by_os` | Visitors by OS (with optional version) |
| `get_goal_conversions` | Goal and event conversion data |
| `get_custom_property_breakdown` | Breakdown by custom event properties |
| `plausible_query` | Raw API v2 query for advanced use cases |

## Usage Examples

Once connected, ask Claude:

- *"How many visitors did I have this week?"*
- *"What are the top 5 pages this month?"*
- *"Where are my visitors coming from?"*
- *"Show me traffic trends over the last 30 days"*
- *"What's my bounce rate this quarter?"*
- *"Which UTM campaigns are driving the most conversions?"*
- *"How many people are on my site right now?"*

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PLAUSIBLE_API_KEY` | Yes | — | Your Plausible Stats API key |
| `PLAUSIBLE_SITE_ID` | Yes | — | Your site domain (e.g. `example.com`) |
| `PLAUSIBLE_BASE_URL` | No | `https://plausible.io` | Base URL for self-hosted instances |

## Development

```bash
git clone https://github.com/er1carruda/plausibleMCP.git
cd plausibleMCP
npm install
npm run build   # Compile TypeScript to dist/
npm start       # Run the server
```

## License

MIT © [Eric Arruda](https://github.com/er1carruda)
