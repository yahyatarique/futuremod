import { useEditor, useValue } from "tldraw";
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

function isLegacyGeoMeta(x: unknown): x is { futuremod: FuturemodShapeMeta } {
  return (
    typeof x === "object" &&
    x !== null &&
    "futuremod" in x &&
    typeof (x as { futuremod: unknown }).futuremod === "object" &&
    (x as { futuremod: { component?: string } }).futuremod?.component !== undefined
  );
}

/**
 * Inspector for **legacy** geo frames. `futuremod` shapes render live on-canvas — no overlay.
 */
export function SelectionPreview() {
  const editor = useEditor();
  const { runQuery } = useDataStudio();
  const selectedShape = useValue(
    "selected-shape",
    () => {
      const id = editor.getOnlySelectedShapeId();
      return id ? editor.getShape(id) : null;
    },
    [editor]
  );

  const [meta, setMeta] = useState<FuturemodShapeMeta | null>(null);
  const [result, setResult] = useState<QueryResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedShape || selectedShape.type === "futuremod") {
        setMeta(null);
        setResult(null);
        return;
      }
      const rawMeta = selectedShape.meta;
      if (!rawMeta || !isLegacyGeoMeta(rawMeta)) {
        setMeta(null);
        setResult(null);
        return;
      }
      const fm = rawMeta.futuremod;
      setMeta(fm);
      if (fm.queryId) {
        const res = await runQuery(fm.queryId);
        if (!cancelled) setResult(res);
      } else {
        setResult(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedShape, runQuery]);

  if (!selectedShape) {
    return (
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[200] flex justify-center">
        <div className="rounded-lg border border-border bg-card/95 px-4 py-2 text-sm text-muted-foreground shadow-lg backdrop-blur">
          New blocks render as live UI on the canvas.
        </div>
      </div>
    );
  }

  if (selectedShape.type === "futuremod") {
    return null;
  }

  if (!meta) {
    return null;
  }

  const revenues =
    result?.rows?.map((r) => r.revenue).filter((v): v is number => typeof v === "number") ?? [];
  const lastRev = revenues.length ? revenues[revenues.length - 1]! : 0;

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[200] flex max-h-[40vh] justify-center overflow-auto">
      <div className="pointer-events-auto w-full max-w-lg rounded-xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Legacy frame preview — prefer palette blocks for on-canvas UI.
        </p>
        {meta.component === "StatCard" && (
          <StatCard
            label={meta.title ?? "Metric"}
            value={revenues.length ? `$${lastRev.toLocaleString()}` : "—"}
            description={meta.queryId ? `Query: ${meta.queryId}` : "Bind a query"}
            trend={revenues.length > 1 ? { direction: "up", value: "vs prior month" } : undefined}
          />
        )}
        {meta.component === "Table" && result && result.columns.length > 0 && (
          <div className="mt-2 overflow-auto rounded-md border">
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
          </div>
        )}
        {meta.component === "Alert" && (
          <Alert variant="default" className="mt-1">
            <AlertTitle>{meta.title ?? "Insight"}</AlertTitle>
          </Alert>
        )}
      </div>
    </div>
  );
}
