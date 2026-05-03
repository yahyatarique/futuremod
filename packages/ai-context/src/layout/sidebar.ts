import type { RegistryItem } from "../types";

export const sidebar: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "sidebar",
  type: "registry:layout",
  title: "Sidebar",
  description: "App navigation sidebar with nav groups and items.",
  dependencies: [],
  registryDependencies: [],
  import: "import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, NavItem, NavGroup } from '@futuremod/ui'",
  files: [{ path: "components/layout/sidebar.tsx", type: "registry:layout" }],
  props: [
    { name: "collapsed", type: "boolean", default: "false", required: false, description: "Icon-only mode" },
    { name: "width", type: "'sm'|'default'|'lg'", default: "default", required: false, description: "Sidebar width" },
  ],
  example: `<Sidebar>
  <SidebarHeader>
    <span className="font-bold">Acme</span>
  </SidebarHeader>
  <SidebarContent>
    <NavGroup label="Main">
      <NavItem href="/dashboard" icon={<LayoutDashboard />} active>Dashboard</NavItem>
      <NavItem href="/users" icon={<Users />} badge={3}>Users</NavItem>
    </NavGroup>
  </SidebarContent>
  <SidebarFooter>
    <Avatar src="/me.png" fallback="YT" size="sm" />
  </SidebarFooter>
</Sidebar>`,
};