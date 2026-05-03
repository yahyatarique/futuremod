import type { RegistryItem } from "../types";

export const badge: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "badge",
  type: "registry:ui",
  title: "Badge",
  description: "Status label / pill.",
  dependencies: ["class-variance-authority"],
  registryDependencies: [],
  import: "import { Badge } from '@futuremod/ui'",
  files: [{ path: "components/ui/badge.tsx", type: "registry:ui" }],
  props: [
    { name: "variant", type: "'default'|'secondary'|'destructive'|'outline'|'success'|'warning'|'accent'|'muted'", default: "default", required: false, description: "Color/style" },
    { name: "children", type: "ReactNode", required: true, description: "Label text" },
  ],
  variants: ["default", "secondary", "destructive", "outline", "success", "warning", "accent", "muted"],
  example: `<Badge variant="success">Active</Badge>`,
};