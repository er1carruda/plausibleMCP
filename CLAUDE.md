# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build   # Compile TypeScript to dist/
npm start       # Run the compiled server (dist/index.js)
```

There are no tests in this project. To run the server manually for testing, set `PLAUSIBLE_API_KEY` and `PLAUSIBLE_SITE_ID` environment variables first.

## Architecture

This is an MCP (Model Context Protocol) server that wraps the Plausible Analytics Stats API v2. It communicates over stdio transport and exposes 14 analytics tools to MCP clients (Claude Desktop, Claude Code, etc.).

**Data flow:** MCP Client → `src/index.ts` (server + tool registration) → tool handler → `PlausibleClient` → plausible.io API

### Key files

- `src/index.ts` — Server entry point: reads env vars, instantiates `PlausibleClient`, registers all tools via stdio transport
- `src/plausible-client.ts` — HTTP client: `query()` (POST `/api/v2/query`) and `getCurrentVisitors()` (GET `/api/v1/stats/realtime/visitors`)
- `src/types.ts` — Shared types: `Metric`, `Dimension`, `Filter`, `PlausibleQuery`, `PlausibleResponse`
- `src/tools/types.ts` — `ToolDefinition` interface: `{ name, description, schema (Zod), handler }`
- `src/tools/index.ts` — Imports and re-exports all tool definitions as an array

### Tool pattern

Each file in `src/tools/` exports a `toolDef: ToolDefinition` with a Zod schema and a handler. The handler receives a `PlausibleClient` instance and validated params, calls the API, and returns `{ content: [{ type: "text", text: string }] }`.

### Distribution

The project is distributed as a `.dxt` extension package. The `server/` directory contains pre-compiled JS (mirrors `dist/` but is tracked for packaging). The `manifest.json` defines the `.dxt` metadata and user-configurable fields (`api_key`, `site_id`, `base_url`).

## Environment variables

- `PLAUSIBLE_API_KEY` — Required. Stats API key from plausible.io account settings.
- `PLAUSIBLE_SITE_ID` — Required. Domain of the site (e.g., `example.com`).
- `PLAUSIBLE_BASE_URL` — Optional. For self-hosted instances (default: `https://plausible.io`).
