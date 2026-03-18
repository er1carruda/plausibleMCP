# Plausible MCP Server — Design Spec

## Context

Build an MCP (Model Context Protocol) server that exposes Plausible Analytics (Cloud, plausible.io) Stats API v2 as tools for AI assistants. This lets Claude and other MCP clients query website analytics data conversationally — asking about traffic, top pages, sources, geography, devices, conversions, and more.

## Decisions

- **Runtime**: TypeScript with `@modelcontextprotocol/sdk`
- **Transport**: stdio (standard for CLI MCP clients)
- **API target**: Plausible Stats API v2 only (`POST /api/v2/query`)
- **Approach**: 13 purpose-built tools + 1 raw query tool (hybrid)
- **Config**: Environment variables (`PLAUSIBLE_API_KEY`, `PLAUSIBLE_SITE_ID`)

## Architecture

```
┌─────────────┐     stdio      ┌──────────────────┐     HTTPS     ┌─────────────────┐
│  MCP Client  │◄─────────────►│  Plausible MCP   │──────────────►│  plausible.io   │
│  (Claude)    │               │  Server (TS)      │               │  /api/v2/query  │
└─────────────┘               └──────────────────┘               └─────────────────┘
```

### Project Structure

```
plausibleMCP/
├── src/
│   ├── index.ts              # Entry point, MCP server setup
│   ├── plausible-client.ts   # HTTP client for Plausible API v2
│   ├── tools/
│   │   ├── index.ts          # Tool registry (exports all tools)
│   │   ├── aggregate.ts      # get_aggregate
│   │   ├── timeseries.ts     # get_timeseries
│   │   ├── current-visitors.ts # get_current_visitors
│   │   ├── top-pages.ts      # get_top_pages
│   │   ├── page-breakdown.ts # get_page_breakdown
│   │   ├── top-sources.ts    # get_top_sources
│   │   ├── utm-breakdown.ts  # get_utm_breakdown
│   │   ├── location.ts       # get_breakdown_by_location
│   │   ├── device.ts         # get_breakdown_by_device
│   │   ├── browser.ts        # get_breakdown_by_browser
│   │   ├── os.ts             # get_breakdown_by_os
│   │   ├── goals.ts          # get_goal_conversions
│   │   ├── custom-property.ts # get_custom_property_breakdown
│   │   └── raw-query.ts      # plausible_query
│   └── types.ts              # Shared TypeScript types
├── package.json
├── tsconfig.json
└── .env.example
```

## Tools

### Traffic & Visitors

#### `get_current_visitors`
Returns the number of people currently on the site (last 5 minutes).
- **Parameters**: none
- **Plausible query**: `metrics: ["visitors"], date_range: "realtime"`

#### `get_aggregate`
Returns aggregate metrics for a given time period.
- **Parameters**:
  - `metrics`: string[] — e.g. `["visitors", "pageviews", "bounce_rate", "visit_duration"]`
  - `date_range`: string — e.g. `"7d"`, `"30d"`, `"month"`, `["2024-01-01", "2024-03-01"]`
  - `filters`?: filter expression (see Filters section)
- **Plausible query**: No dimensions, just metrics

#### `get_timeseries`
Returns metrics broken down over time.
- **Parameters**:
  - `metrics`: string[] — defaults to `["visitors"]`
  - `date_range`: string
  - `interval`: `"hour"` | `"day"` | `"week"` | `"month"` — defaults to `"day"`
  - `filters`?: filter expression
- **Plausible query**: dimension `time:<interval>`

### Content

#### `get_top_pages`
Returns top pages ranked by visitors.
- **Parameters**:
  - `date_range`: string
  - `limit`?: number (default 10)
  - `page_type`?: `"all"` | `"entry"` | `"exit"` — defaults to `"all"`
  - `filters`?: filter expression
- **Plausible query**: dimension is `event:page`, `visit:entry_page`, or `visit:exit_page`

#### `get_page_breakdown`
Returns detailed metrics for a specific page or page pattern.
- **Parameters**:
  - `page_path`: string — e.g. `"/blog"` or `"/blog/**"`
  - `date_range`: string
  - `metrics`?: string[] — defaults to `["visitors", "pageviews", "bounce_rate", "time_on_page"]`
- **Plausible query**: filter on `event:page`, no dimensions (aggregate for that page)

### Acquisition

#### `get_top_sources`
Returns top traffic sources.
- **Parameters**:
  - `date_range`: string
  - `limit`?: number (default 10)
  - `source_type`?: `"source"` | `"referrer"` | `"channel"` — defaults to `"source"`
  - `filters`?: filter expression
- **Plausible query**: dimension is `visit:source`, `visit:referrer`, or `visit:channel`

#### `get_utm_breakdown`
Returns breakdown by UTM parameters.
- **Parameters**:
  - `utm_param`: `"source"` | `"medium"` | `"campaign"` | `"content"` | `"term"`
  - `date_range`: string
  - `limit`?: number (default 10)
  - `filters`?: filter expression
- **Plausible query**: dimension is `visit:utm_<param>`

### Geography

#### `get_breakdown_by_location`
Returns visitors broken down by geographic location.
- **Parameters**:
  - `location_type`?: `"country"` | `"region"` | `"city"` — defaults to `"country"`
  - `date_range`: string
  - `limit`?: number (default 10)
  - `country_filter`?: string — ISO country code, for drilling into regions
  - `region_filter`?: string — for drilling into cities
  - `filters`?: filter expression
- **Plausible query**: dimension is `visit:country_name`, `visit:region_name`, or `visit:city_name`, with appropriate filters

### Technology

#### `get_breakdown_by_device`
Returns visitors by device type (Desktop, Mobile, Tablet).
- **Parameters**:
  - `date_range`: string
  - `filters`?: filter expression
- **Plausible query**: dimension `visit:device`

#### `get_breakdown_by_browser`
Returns visitors by browser.
- **Parameters**:
  - `date_range`: string
  - `limit`?: number (default 10)
  - `include_version`?: boolean (default false)
  - `filters`?: filter expression
- **Plausible query**: dimensions `visit:browser` (+ `visit:browser_version` if include_version)

#### `get_breakdown_by_os`
Returns visitors by operating system.
- **Parameters**:
  - `date_range`: string
  - `limit`?: number (default 10)
  - `include_version`?: boolean (default false)
  - `filters`?: filter expression
- **Plausible query**: dimensions `visit:os` (+ `visit:os_version` if include_version)

### Goals & Conversions

#### `get_goal_conversions`
Returns conversion data for goals.
- **Parameters**:
  - `date_range`: string
  - `goal_filter`?: string — specific goal name to filter by
  - `filters`?: filter expression
- **Plausible query**: dimension `event:goal`, metrics include `visitors`, `events`, `conversion_rate`

### Custom Properties

#### `get_custom_property_breakdown`
Returns breakdown by a custom event property.
- **Parameters**:
  - `property_name`: string — the custom property key (without `event:props:` prefix)
  - `date_range`: string
  - `limit`?: number (default 10)
  - `filters`?: filter expression
- **Plausible query**: dimension `event:props:<property_name>`

### Raw Query

#### `plausible_query`
Executes an arbitrary Stats API v2 query for advanced use cases.
- **Parameters**:
  - `metrics`: string[]
  - `date_range`: string | string[]
  - `dimensions`?: string[]
  - `filters`?: any (raw filter expression)
  - `order_by`?: any
  - `limit`?: number
  - `offset`?: number
  - `include`?: object
- **Plausible query**: passes through directly

## Filters

All tools that accept a `filters` parameter take the Plausible v2 filter format:

```json
["and", [
  ["is", "visit:source", ["Google"]],
  ["is", "visit:country", ["US"]]
]]
```

The tool descriptions will include examples of common filter patterns so the AI can construct them correctly.

## Plausible API Client

A single `PlausibleClient` class handles all HTTP communication:

```typescript
class PlausibleClient {
  constructor(apiKey: string, siteId: string, baseUrl?: string)
  async query(params: PlausibleQuery): Promise<PlausibleResponse>
  async getCurrentVisitors(): Promise<number>
}
```

- Uses native `fetch` (Node 18+)
- Handles auth header injection
- Returns typed responses
- Throws descriptive errors on API failures (rate limit, auth, invalid query)

## Error Handling

- Missing `PLAUSIBLE_API_KEY` or `PLAUSIBLE_SITE_ID` → clear error at startup
- API 401 → "Invalid API key" error
- API 429 → "Rate limited, try again later" with retry-after info
- API 400 → forward Plausible's error message (usually describes what's wrong with the query)

## Verification

1. **Build**: `npm run build` compiles without errors
2. **Manual test**: Configure env vars, connect via Claude Code MCP settings, ask "how many visitors did I have this week?"
3. **Tool discovery**: Verify all 14 tools appear in MCP client tool list
4. **Each tool**: Test at least one query per tool category
5. **Error cases**: Test with invalid API key, missing env vars, invalid date ranges
