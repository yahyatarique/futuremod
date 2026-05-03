import { useEffect, useState } from "react";
import type { Config } from "@measured/puck";
import { items } from "@futuremod/ai-context";
import type { PropDef } from "@futuremod/ai-context";
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  AlertTitle,
  AlertDescription,
  Badge,
  Button,
  Avatar,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@futuremod/ui";
import { useDataStudio } from "../data/DataStudioContext";
import type { QueryResult } from "../data/types";

// ---------------------------------------------------------------------------
// Field generation from @futuremod/ai-context PropDef[] metadata
// ---------------------------------------------------------------------------

type PuckField =
  | { type: "text"; label?: string }
  | { type: "textarea"; label?: string }
  | { type: "number"; label?: string }
  | { type: "radio"; label?: string; options: { value: string | boolean; label: string }[] }
  | { type: "select"; label?: string; options: { value: string; label: string }[] };

function parseUnionOptions(type: string): { value: string; label: string }[] | null {
  if (!type.includes("'")) return null;
  const parts = type
    .split("|")
    .map((v) => v.trim().replace(/^'|'$/g, "").trim())
    .filter(Boolean);
  return parts.length > 1 ? parts.map((v) => ({ value: v, label: v })) : null;
}

function propDefToField(prop: PropDef): [string, PuckField] | null {
  const t = prop.type;
  // Skip non-editable types
  if (
    t === "ReactNode" ||
    t.startsWith("(") ||
    (t.startsWith("{") && !t.includes("'"))
  )
    return null;

  if (t === "boolean") {
    return [
      prop.name,
      {
        type: "radio",
        label: prop.description,
        options: [
          { value: true, label: "Yes" },
          { value: false, label: "No" },
        ],
      },
    ];
  }

  const opts = parseUnionOptions(t);
  if (opts) {
    return [prop.name, { type: "select", label: prop.description, options: opts }];
  }

  if (t === "string" || t === "string | number") {
    return [prop.name, { type: "text", label: prop.description }];
  }

  return null;
}

function buildFields(
  registryName: string,
  extra: Record<string, PuckField> = {},
  skip: string[] = []
): Record<string, PuckField> {
  const item = items.find((i) => i.name === registryName);
  const base: Record<string, PuckField> = {};
  if (item) {
    for (const prop of item.props) {
      if (skip.includes(prop.name)) continue;
      const entry = propDefToField(prop);
      if (entry) base[entry[0]] = entry[1];
    }
  }
  return { ...base, ...extra };
}

const queryIdField: Record<string, PuckField> = {
  queryId: { type: "text", label: "Query ID" },
};

// ---------------------------------------------------------------------------
// Data-bound block render components (use DataStudio context internally)
// ---------------------------------------------------------------------------

function useQueryResult(queryId: string | undefined): QueryResult | null {
  const { runQuery } = useDataStudio();
  const [result, setResult] = useState<QueryResult | null>(null);

  useEffect(() => {
    if (!queryId) {
      setResult(null);
      return;
    }
    let cancelled = false;
    runQuery(queryId).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [queryId, runQuery]);

  return result;
}

function StatCardBlock({
  label,
  value,
  description,
  variant,
  queryId,
}: {
  label?: string;
  value?: string;
  description?: string;
  variant?: "default" | "glass";
  queryId?: string;
}) {
  const result = useQueryResult(queryId);
  const revenues =
    result?.rows
      ?.map((r) => r.revenue)
      .filter((v): v is number => typeof v === "number") ?? [];
  const displayValue =
    result && revenues.length ? `$${revenues.at(-1)!.toLocaleString()}` : value ?? "—";

  return (
    <StatCard
      label={label ?? "Metric"}
      value={displayValue}
      description={description}
      variant={variant}
      trend={revenues.length > 1 ? { direction: "up", value: "vs prior" } : undefined}
    />
  );
}

function DataTableBlock({ title, queryId }: { title?: string; queryId?: string }) {
  const result = useQueryResult(queryId);

  if (!result || !result.columns.length) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        {queryId ? "Loading…" : "Bind a query to load rows."}
      </p>
    );
  }

  return (
    <div>
      {title && <p className="mb-2 px-1 text-sm font-medium">{title}</p>}
      <div className="overflow-auto rounded-md border">
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Puck Config
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const puckConfig: Config<any, any> = {
  categories: {
    data: {
      title: "Data",
      components: ["StatCard", "DataTable"],
      defaultExpanded: true,
    },
    display: {
      title: "Display",
      components: ["AlertBlock", "CardBlock", "BadgeBlock", "AvatarBlock"],
      defaultExpanded: true,
    },
    actions: {
      title: "Actions",
      components: ["ButtonBlock"],
      defaultExpanded: false,
    },
    layout: {
      title: "Layout",
      components: ["EmptyStateBlock"],
      defaultExpanded: false,
    },
  },

  components: {
    StatCard: {
      label: "Stat Card",
      fields: buildFields("stat-card", queryIdField, ["icon", "trend", "children"]),
      defaultProps: { label: "Metric", value: "0", variant: "default", queryId: "" },
      render: ({ label, value, description, variant, queryId }) => (
        <StatCardBlock
          label={label}
          value={value}
          description={description}
          variant={variant}
          queryId={queryId}
        />
      ),
    },

    DataTable: {
      label: "Data Table",
      fields: {
        title: { type: "text", label: "Table title" },
        ...queryIdField,
      },
      defaultProps: { title: "", queryId: "q-revenue" },
      render: ({ title, queryId }) => <DataTableBlock title={title} queryId={queryId} />,
    },

    AlertBlock: {
      label: "Alert",
      fields: {
        ...buildFields("alert", {}, ["children"]),
        title: { type: "text", label: "Title" },
        description: { type: "text", label: "Description" },
      },
      defaultProps: { variant: "default", title: "Heads up!", description: "" },
      render: ({ variant, title, description }) => (
        <Alert variant={variant}>
          <AlertTitle>{title}</AlertTitle>
          {description && <AlertDescription>{description}</AlertDescription>}
        </Alert>
      ),
    },

    CardBlock: {
      label: "Card",
      fields: {
        ...buildFields("card", {}, ["children"]),
        title: { type: "text", label: "Title" },
        content: { type: "textarea", label: "Content" },
      },
      defaultProps: { variant: "default", padding: "default", title: "Card", content: "" },
      render: ({ variant, padding, title, content }) => (
        <Card variant={variant} padding={padding}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          {content && (
            <CardContent>
              <p className="text-sm text-muted-foreground">{content}</p>
            </CardContent>
          )}
        </Card>
      ),
    },

    BadgeBlock: {
      label: "Badge",
      fields: {
        ...buildFields("badge", {}, ["children"]),
        label: { type: "text", label: "Label" },
      },
      defaultProps: { variant: "default", label: "Badge" },
      render: ({ variant, label }) => <Badge variant={variant}>{label}</Badge>,
    },

    ButtonBlock: {
      label: "Button",
      fields: {
        ...buildFields("button", {}, ["children", "onClick", "disabled", "loading"]),
        label: { type: "text", label: "Label" },
      },
      defaultProps: { variant: "default", size: "default", label: "Click me" },
      render: ({ variant, size, label }) => (
        <Button variant={variant} size={size}>
          {label}
        </Button>
      ),
    },

    AvatarBlock: {
      label: "Avatar",
      fields: buildFields("avatar"),
      defaultProps: { fallback: "AB", size: "default" },
      render: ({ src, alt, fallback, size }) => (
        <Avatar src={src} alt={alt} fallback={fallback} size={size} />
      ),
    },

    EmptyStateBlock: {
      label: "Empty State",
      fields: buildFields("empty-state", {}, ["icon", "action"]),
      defaultProps: {
        title: "Nothing here yet",
        description: "Get started by adding some content.",
      },
      render: ({ title, description }) => (
        <EmptyState title={title} description={description} />
      ),
    },
  },
};
