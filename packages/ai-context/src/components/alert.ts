import type { RegistryItem } from "../types";

export const alert: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "alert",
  type: "registry:ui",
  title: "Alert",
  description: "Feedback banner — info, success, warning, error.",
  dependencies: [],
  registryDependencies: [],
  import: "import { Alert, AlertTitle, AlertDescription } from '@futuremod/ui'",
  files: [{ path: "components/ui/alert.tsx", type: "registry:ui" }],
  props: [
    { name: "variant", type: "'default'|'destructive'|'success'|'warning'|'info'", default: "default", required: false, description: "Semantic color" },
    { name: "children", type: "ReactNode", required: true, description: "AlertTitle + AlertDescription" },
  ],
  variants: ["default", "destructive", "success", "warning", "info"],
  example: `<Alert variant="success">
  <AlertTitle>Saved</AlertTitle>
  <AlertDescription>Your changes have been saved.</AlertDescription>
</Alert>`,
};