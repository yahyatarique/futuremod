import { useEffect, useState } from "react";
import {
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Alert,
  AlertTitle,
} from "@futuremod/ui";
import { useDataStudio } from "../data/DataStudioContext";
import type { FuturemodShapeMeta, QueryResult } from "../data/types";

interface Props {
  meta: FuturemodShapeMeta;
}

export function FuturemodBlockContent({ meta }: Props) {
  const { runQuery } = useDataStudio();
  const [result, setResult] = useState<QueryResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!meta.queryId) {
        setResult(null);
        return;
      }
      const res = await runQuery(meta.queryId);
      if (!cancelled) setResult(res);
    })();
    return () => {
      cancelled = true;
    };
  }, [meta.queryId, runQuery]);

  const revenues =
    result?.rows?.map((r) => r.revenue).filter((v): v is number => typeof v === "number") ?? [];
  const lastRev = revenues.length ? revenues[revenues.length - 1]! : 0;

  return (
    <div className="pointer-events-auto flex h-full w-full flex-col overflow-auto rounded-xl border border-primary/25 bg-card p-3 shadow-md">
      {meta.component === "StatCard" && (
        <StatCard
          label={meta.title ?? "Metric"}
          value={revenues.length ? `$${lastRev.toLocaleString()}` : "—"}
          description={meta.queryId ? `Query: ${meta.queryId}` : "Bind a query"}
          trend={revenues.length > 1 ? { direction: "up", value: "vs prior month" } : undefined}
        />
      )}
      {meta.component === "Table" && result && result.columns.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              {result.columns.map((c) => (
                <TableHead key={c}>{c}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.rows.map((row, i) => (
              <TableRow key={i}>
                {result.columns.map((c) => (
                  <TableCell key={c}>{String(row[c] ?? "")}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {meta.component === "Table" && (!result || !result.columns.length) && (
        <p className="text-sm text-muted-foreground">Add a query to load rows.</p>
      )}
      {meta.component === "Alert" && (
        <Alert variant="default">
          <AlertTitle>{meta.title ?? "Insight"}</AlertTitle>
        </Alert>
      )}
      {!["StatCard", "Table", "Alert"].includes(meta.component) && (
        <p className="text-xs text-muted-foreground">{meta.component}</p>
      )}
    </div>
  );
}
