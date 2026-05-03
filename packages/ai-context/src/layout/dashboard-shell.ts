import type { RegistryItem } from "../types.js";

export const dashboardShell: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "dashboard-shell",
  type: "registry:layout",
  title: "DashboardShell",
  description: "Page title + actions bar + content area.",
  dependencies: [],
  registryDependencies: [],
  import: "import { DashboardShell, DashboardGrid } from '@futuremod/ui'",
  files: [{ path: "components/layout/dashboard-shell.tsx", type: "registry:layout" }],
  props: [
    { name: "title", type: "string", required: false, description: "Page heading" },
    { name: "description", type: "string", required: false, description: "Sub-heading" },
    { name: "actions", type: "ReactNode", required: false, description: "Top-right buttons" },
  ],
  example: `<DashboardShell
  title="Analytics"
  description="Last 30 days"
  actions={<Button>Export</Button>}
>
  <DashboardGrid cols={4}>
    <StatCard label="Users" value="1,204" />
    <StatCard label="Revenue" value="$9,840" />
  </DashboardGrid>
</DashboardShell>`,
};