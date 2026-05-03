import type { RegistryItem } from "../types";

export const emptyState: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "empty-state",
  type: "registry:layout",
  title: "EmptyState",
  description: "Zero-data placeholder with icon, title, CTA.",
  dependencies: [],
  registryDependencies: [],
  import: "import { EmptyState } from '@futuremod/ui'",
  files: [{ path: "components/layout/empty-state.tsx", type: "registry:layout" }],
  props: [
    { name: "icon", type: "ReactNode", required: false, description: "Lucide icon" },
    { name: "title", type: "string", required: true, description: "Heading" },
    { name: "description", type: "string", required: false, description: "Sub-text" },
    { name: "action", type: "ReactNode", required: false, description: "CTA button" },
  ],
  example: `<EmptyState
  icon={<Inbox />}
  title="No messages"
  description="When you receive messages they'll appear here."
  action={<Button variant="outline">Refresh</Button>}
/>`,
};