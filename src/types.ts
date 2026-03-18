// Plausible Stats API v2 types

export type Metric =
  | "visitors" | "visits" | "pageviews" | "views_per_visit"
  | "bounce_rate" | "visit_duration" | "events" | "conversion_rate"
  | "time_on_page";

export type Dimension =
  | "event:page" | "event:hostname" | "event:name" | "event:goal"
  | `event:props:${string}`
  | "visit:source" | "visit:referrer" | "visit:channel"
  | "visit:utm_source" | "visit:utm_medium" | "visit:utm_campaign"
  | "visit:utm_content" | "visit:utm_term"
  | "visit:device" | "visit:browser" | "visit:browser_version"
  | "visit:os" | "visit:os_version"
  | "visit:country" | "visit:country_name" | "visit:region" | "visit:region_name"
  | "visit:city" | "visit:city_name"
  | "visit:entry_page" | "visit:exit_page"
  | `time:${string}`;

export type DateRange = string | [string, string];

// Filter format: ["is" | "is_not" | "contains" | "matches", dimension, values[]]
// or logical: ["and" | "or", filters[]] or ["not", filter]
export type Filter = unknown;

export interface PlausibleQuery {
  site_id: string;
  metrics: string[];
  date_range: DateRange;
  dimensions?: string[];
  filters?: Filter;
  order_by?: Array<[string, "asc" | "desc"]>;
  pagination?: {
    limit?: number;
    offset?: number;
  };
  include?: {
    time_labels?: boolean;
    imports?: boolean;
    [key: string]: unknown;
  };
}

export interface PlausibleResultRow {
  dimensions?: string[];
  metrics: number[];
}

export interface PlausibleResponse {
  results: PlausibleResultRow[];
  meta?: {
    time_labels?: string[];
    [key: string]: unknown;
  };
  query?: PlausibleQuery;
}
