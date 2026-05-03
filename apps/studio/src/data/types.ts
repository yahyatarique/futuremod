/** Connection kinds supported by the studio (extend as you add drivers). */
export type DataSourceKind = "sql" | "http" | "google_sheets" | "sample";

export interface DataSourceBase {
  id: string;
  name: string;
  kind: DataSourceKind;
  createdAt: string;
}

/** SQL over a safe server-side proxy — never put raw DB creds in the browser in production. */
export interface SqlDataSource extends DataSourceBase {
  kind: "sql";
  /** Logical name; real DSN / secret lives on the server scoped to the user. */
  connectionRef: string;
  dialect: "postgres" | "mysql" | "sqlite" | "mssql" | "other";
}

export interface HttpDataSource extends DataSourceBase {
  kind: "http";
  baseUrl: string;
  authRef?: string;
}

export interface GoogleSheetsSource extends DataSourceBase {
  kind: "google_sheets";
  spreadsheetId: string;
}

/** Built-in datasets that ship with Studio — no setup required. */
export interface SampleDataSource extends DataSourceBase {
  kind: "sample";
}

export type DataSourceConfig =
  | SqlDataSource
  | HttpDataSource
  | GoogleSheetsSource
  | SampleDataSource;

/** Saved query or HTTP template keyed by id for widgets to bind to. */
export interface QueryDefinition {
  id: string;
  name: string;
  sourceId: string;
  /** SQL text (validated server-side) or HTTP path + method metadata. */
  definition: { type: "sql"; sql: string } | { type: "http"; path: string; method: "GET" | "POST" };
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
}

