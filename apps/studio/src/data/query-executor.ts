import type { DataSourceConfig, QueryDefinition, QueryResult } from "./types";

interface ExecuteArgs {
  userId: string;
  query: QueryDefinition | undefined;
  source: DataSourceConfig | undefined;
}

/**
 * Runs queries for the canvas: **sample** and **sql** sources today (in-browser for samples;
 * SQL definitions are ready to forward to your API). Add a POST to your backend when you connect
 * live databases with tenant-scoped secrets.
 */
export async function executeQueryForStudio({
  userId,
  query,
  source,
}: ExecuteArgs): Promise<QueryResult> {
  if (!query || !source) {
    return { columns: [], rows: [] };
  }

  await new Promise((r) => setTimeout(r, 120));

  if (source.kind !== "sample" && source.kind !== "sql") {
    return {
      columns: ["message"],
      rows: [
        {
          message: `The ${source.kind} connector is not enabled in this workspace yet — use SQL or built-in data.`,
        },
      ],
    };
  }

  if (query.id === "q-revenue") {
    return {
      columns: ["month", "revenue"],
      rows: [
        { month: "Jan", revenue: 12000 + userId.length * 7 },
        { month: "Feb", revenue: 18400 },
        { month: "Mar", revenue: 22100 },
      ],
    };
  }

  return {
    columns: ["note"],
    rows: [{ note: `${query.name} — workspace “${userId}”. Connect your API to return live rows.` }],
  };
}
