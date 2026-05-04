import { useEffect, useState } from "react";
import type { Config } from "@measured/puck";
import { DropZone } from "@measured/puck";
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
  DashboardShell,
  Separator,
  FormField,
  Input,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@futuremod/ui";
import { useDataStudio } from "../data/DataStudioContext";
import type { QueryResult } from "../data/types";
import {
  buildPageRootSurfaceStyle,
  PAGE_PATTERN_FIELD_OPTIONS,
  type PagePatternId,
} from "./page-background-patterns";

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

const gapFieldOptions = [
  { value: "gap-3", label: "Tight" },
  { value: "gap-4", label: "Default" },
  { value: "gap-6", label: "Relaxed" },
] as const;

function parseSelectOptionsFromLines(text: string): { value: string; label: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const pipe = line.indexOf("|");
      if (pipe === -1) {
        return { value: line, label: line };
      }
      return {
        value: line.slice(0, pipe).trim(),
        label: line.slice(pipe + 1).trim() || line.slice(0, pipe).trim(),
      };
    })
    .filter((o) => o.value.length > 0);
}

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

// ---------------------------------------------------------------------------
// Page root — wraps all blocks in the editor canvas and on published pages
// ---------------------------------------------------------------------------

const maxWidthOptions = [
  { value: "max-w-sm",  label: "Narrow (640px)" },
  { value: "max-w-2xl", label: "Medium (768px)" },
  { value: "max-w-4xl", label: "Wide (1024px)" },
  { value: "max-w-full", label: "Full width" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const puckConfig: Config<any, any> = {
  root: {
    fields: {
      maxWidth: {
        type: "select",
        label: "Page width",
        options: maxWidthOptions,
      },
      paddingX: {
        type: "select",
        label: "Horizontal padding",
        options: [
          { value: "px-4",  label: "Small" },
          { value: "px-6",  label: "Medium" },
          { value: "px-10", label: "Large" },
        ],
      },
      paddingY: {
        type: "select",
        label: "Vertical padding",
        options: [
          { value: "py-6",  label: "Small" },
          { value: "py-10", label: "Medium" },
          { value: "py-16", label: "Large" },
        ],
      },
      pattern: {
        type: "select",
        label: "Page pattern",
        options: PAGE_PATTERN_FIELD_OPTIONS,
      },
      colorA: {
        type: "text",
        label: "Pattern color A (hex, e.g. #64748b)",
      },
      colorB: {
        type: "text",
        label: "Pattern color B (hex)",
      },
    },
    defaultProps: {
      maxWidth: "max-w-2xl",
      paddingX: "px-6",
      paddingY: "py-10",
      pattern: "none" satisfies PagePatternId,
      colorA: "#64748b",
      colorB: "#94a3b8",
    },
    render: ({ children, maxWidth, paddingX, paddingY, pattern, colorA, colorB }) => (
      <div
        className="min-h-[100dvh] w-full"
        style={buildPageRootSurfaceStyle(pattern as PagePatternId, colorA, colorB, {
          maxWidthClass: maxWidth,
          paddingXClass: paddingX,
        })}
      >
        <div className={`mx-auto w-full space-y-4 ${maxWidth} ${paddingX} ${paddingY}`}>
          {children}
        </div>
      </div>
    ),
  },

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
      components: [
        "DashboardShellBlock",
        "Grid2Block",
        "Grid3Block",
        "GridFlow2Block",
        "GridFlow3Block",
        "SeparatorBlock",
        "EmptyStateBlock",
      ],
      defaultExpanded: true,
    },
    controls: {
      title: "Controls",
      components: ["TabsBlock", "InputBlock", "SelectBlock"],
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

    DashboardShellBlock: {
      label: "Dashboard shell",
      fields: buildFields("dashboard-shell", {}, ["actions"]),
      defaultProps: {
        title: "Dashboard",
        description: "Summary and key metrics",
      },
      render: ({ title, description }) => (
        <DashboardShell title={title} description={description}>
          <DropZone zone="main" minEmptyHeight={160} collisionAxis="dynamic" />
        </DashboardShell>
      ),
    },

    Grid2Block: {
      label: "2-column grid",
      fields: {
        gap: { type: "select", label: "Column gap", options: [...gapFieldOptions] },
      },
      defaultProps: { gap: "gap-4" },
      render: ({ gap }) => (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${gap}`}>
          <DropZone zone="col-0" minEmptyHeight={120} collisionAxis="dynamic" />
          <DropZone zone="col-1" minEmptyHeight={120} collisionAxis="dynamic" />
        </div>
      ),
    },

    Grid3Block: {
      label: "3-column grid",
      fields: {
        gap: { type: "select", label: "Column gap", options: [...gapFieldOptions] },
      },
      defaultProps: { gap: "gap-4" },
      render: ({ gap }) => (
        <div className={`grid grid-cols-1 md:grid-cols-3 ${gap}`}>
          <DropZone zone="col-0" minEmptyHeight={120} collisionAxis="dynamic" />
          <DropZone zone="col-1" minEmptyHeight={120} collisionAxis="dynamic" />
          <DropZone zone="col-2" minEmptyHeight={120} collisionAxis="dynamic" />
        </div>
      ),
    },

    GridFlow2Block: {
      label: "2-column flow",
      fields: {
        gap: { type: "select", label: "Gap", options: [...gapFieldOptions] },
      },
      defaultProps: { gap: "gap-4" },
      render: ({ gap }) => (
        <DropZone
          zone="flow"
          className={`grid grid-cols-1 md:grid-cols-2 ${gap}`}
          minEmptyHeight={140}
          collisionAxis="dynamic"
        />
      ),
    },

    GridFlow3Block: {
      label: "3-column flow",
      fields: {
        gap: { type: "select", label: "Gap", options: [...gapFieldOptions] },
      },
      defaultProps: { gap: "gap-4" },
      render: ({ gap }) => (
        <DropZone
          zone="flow"
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gap}`}
          minEmptyHeight={140}
          collisionAxis="dynamic"
        />
      ),
    },

    SeparatorBlock: {
      label: "Separator",
      fields: {
        orientation: {
          type: "radio",
          label: "Orientation",
          options: [
            { value: "horizontal", label: "Horizontal" },
            { value: "vertical", label: "Vertical" },
          ],
        },
      },
      defaultProps: { orientation: "horizontal" },
      render: ({ orientation }) => (
        <Separator orientation={orientation === "vertical" ? "vertical" : "horizontal"} />
      ),
    },

    TabsBlock: {
      label: "Tabs",
      fields: {
        tab1Label: { type: "text", label: "Tab 1 label" },
        tab2Label: { type: "text", label: "Tab 2 label" },
      },
      defaultProps: { tab1Label: "Overview", tab2Label: "Details" },
      render: ({ tab1Label, tab2Label, editMode }) =>
        editMode ? (
          <div className="space-y-6 rounded-lg border border-dashed border-border p-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">{tab1Label}</p>
              <DropZone zone="tab-0" minEmptyHeight={96} collisionAxis="dynamic" />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">{tab2Label}</p>
              <DropZone zone="tab-1" minEmptyHeight={96} collisionAxis="dynamic" />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="tab-0">
            <TabsList>
              <TabsTrigger value="tab-0">{tab1Label}</TabsTrigger>
              <TabsTrigger value="tab-1">{tab2Label}</TabsTrigger>
            </TabsList>
            <TabsContent value="tab-0">
              <DropZone zone="tab-0" minEmptyHeight={80} collisionAxis="dynamic" />
            </TabsContent>
            <TabsContent value="tab-1">
              <DropZone zone="tab-1" minEmptyHeight={80} collisionAxis="dynamic" />
            </TabsContent>
          </Tabs>
        ),
    },

    InputBlock: {
      label: "Input",
      fields: {
        ...buildFields("form-field", {}, ["children"]),
        ...buildFields("input", {}, ["value", "onChange", "error"]),
      },
      defaultProps: {
        label: "Field",
        hint: "",
        required: false,
        type: "text",
        placeholder: "",
        disabled: false,
      },
      render: ({ label, hint, required, error, type, placeholder, disabled }) => (
        <FormField label={label} hint={hint || undefined} required={required} error={error || undefined}>
          <Input type={type} placeholder={placeholder || undefined} disabled={disabled} readOnly />
        </FormField>
      ),
    },

    SelectBlock: {
      label: "Select",
      fields: {
        ...buildFields("form-field", {}, ["children"]),
        placeholder: { type: "text", label: "Placeholder" },
        optionsText: {
          type: "textarea",
          label: "Options (one per line: value|label)",
        },
        disabled: {
          type: "radio",
          label: "Disabled",
          options: [
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ],
        },
      },
      defaultProps: {
        label: "Choose",
        hint: "",
        required: false,
        placeholder: "Select…",
        optionsText: "daily|Daily\nweekly|Weekly\nmonthly|Monthly",
        disabled: false,
      },
      render: ({ label, hint, required, error, placeholder, optionsText, disabled }) => {
        const options = parseSelectOptionsFromLines(optionsText ?? "");
        return (
          <FormField label={label} hint={hint || undefined} required={required} error={error || undefined}>
            <Select
              options={options.length ? options : [{ value: "_", label: "Add options" }]}
              placeholder={placeholder || undefined}
              disabled={disabled}
              defaultValue=""
            />
          </FormField>
        );
      },
    },
  },
};
