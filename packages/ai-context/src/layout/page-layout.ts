import type { RegistryItem } from "../types.js";

export const pageLayout: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "page-layout",
  type: "registry:layout",
  title: "PageLayout",
  description: "Full-page shell: sidebar + header + main content.",
  dependencies: [],
  registryDependencies: ["sidebar", "header"],
  import: "import { PageLayout } from '@futuremod/ui'",
  files: [{ path: "components/layout/page-layout.tsx", type: "registry:layout" }],
  props: [
    { name: "sidebar", type: "ReactNode", required: false, description: "Sidebar component" },
    { name: "header", type: "ReactNode", required: false, description: "Header component" },
    { name: "footer", type: "ReactNode", required: false, description: "Footer component" },
    { name: "children", type: "ReactNode", required: true, description: "Page content" },
  ],
  example: `<PageLayout
  sidebar={<Sidebar>...</Sidebar>}
  header={<Header sticky glass><HeaderTitle>Dashboard</HeaderTitle></Header>}
>
  <DashboardShell title="Overview">...</DashboardShell>
</PageLayout>`,
};